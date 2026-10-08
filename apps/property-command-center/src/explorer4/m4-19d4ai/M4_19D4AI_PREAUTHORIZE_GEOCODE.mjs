#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,nonEmpty} from "./M419D4AIRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const ah7Path=path.join(ev,"m4-19d4ah7-record-structural-locator-reconciliation-certification.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const resultPath=path.join(ev,"m4-19d4ai-certified-address-locator-geocode-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4ai-certified-address-geocode-preauthorization-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,
      canonicalWriteAuthority:false,
      identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,
      refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,
      syncAuthority:false,
      propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      networkRequestsPerformed:0,
      geocodeRequestsPerformed:0,
      enrichmentRequestsPerformed:0,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [ah7Path,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AI_PREREQUISITE_MISSING",{path:p},3);
}
const ah7=JSON.parse(fs.readFileSync(ah7Path,"utf8"));
if(ah7?.state!=="M419D4AH7_ONE_RECORD_STRUCTURAL_LOCATOR_CERTIFIED_GEOCODE_PREAUTHORIZATION_READY"){
  finish("BLOCKED","M419D4AI_AH7_CERTIFIED_LOCATOR_STATE_REQUIRED",{observed:ah7?.state??null},3);
}
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const bound=locator?.boundIdentity||{};
const address=locator?.locator?.address;
const normalizedAddress=locator?.locator?.normalizedAddress;

if(!nonEmpty(bound.canonicalPropertyId)||!nonEmpty(bound.sourcePropertyId)||!nonEmpty(address)){
  finish("BLOCKED","M419D4AI_CERTIFIED_LOCATOR_MANIFEST_INCOMPLETE",{},3);
}
if(locator?.locator?.sourceBacked!==true||locator?.locator?.structurallyBound!==true||locator?.locator?.corroborated!==true){
  finish("BLOCKED","M419D4AI_LOCATOR_CERTIFICATION_FLAGS_REQUIRED",{},3);
}

// Preauthorize a geocode request contract only. No network request in this milestone.
// The actual execution milestone may bind to an approved geocoder implementation.
const requestContract={
  purpose:"CERTIFIED_ADDRESS_TO_COORDINATE_OBSERVATION",
  input:{
    canonicalPropertyId:bound.canonicalPropertyId,
    sourcePropertyId:bound.sourcePropertyId,
    address,
    normalizedAddress
  },
  requirements:{
    sourceNativeGeocodeResponseRequired:true,
    latitudeRequired:true,
    longitudeRequired:true,
    providerIdentityRequired:true,
    observationTimestampRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    exactRequestHashRequired:true,
    addressMatchEvidenceRequired:true,
    contradictoryResultMustBlock:true,
    zeroZeroResultMustBlock:true,
    nullCoordinatesMustBlock:true,
    maximumGeocodeRequests:1,
    automaticRetry:false,
    blindRetry:false
  }
};
const requestHash=sha(JSON.stringify(requestContract));

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AI_CERTIFIED_ADDRESS_GEOCODE_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:bound,
  certifiedLocator:{
    address,
    normalizedAddress,
    locatorManifestPath:locatorPath,
    locatorManifestSha256:sha(fs.readFileSync(locatorPath,"utf8")),
    sourceBacked:true,
    structurallyBound:true,
    corroborated:true,
    families:locator?.locator?.families??[]
  },
  requestContract,
  requestHash,
  executionPolicy:{
    geocodeExecutionAuthorized:false,
    explicitAuthorizationRequired:true,
    maximumGeocodeRequests:1,
    automaticRetry:false,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    sourceNativeCoordinateQualificationRequired:true
  }
};
write(manifestPath,manifest);

finish("PASSED","M419D4AI_CERTIFIED_ADDRESS_LOCATOR_GEOCODE_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  binding:{
    canonicalPropertyId:bound.canonicalPropertyId,
    sourcePropertyId:bound.sourcePropertyId,
    address,
    normalizedAddress,
    requestHash,
    maximumGeocodeRequests:1,
    geocodeExecutionAuthorized:false
  },
  policy:{
    sourceNativeGeocodeResponseRequired:true,
    zeroZeroResultMustBlock:true,
    nullCoordinatesMustBlock:true,
    contradictoryResultMustBlock:true,
    automaticRetry:false,
    explicitAuthorizationRequired:true
  },
  artifacts:{geocodePreauthorizationManifest:manifestPath},
  nextMilestone:"M4.19D4AJ_CONTROLLED_SINGLE_GEOCODE_EXECUTION_AND_COORDINATE_EVIDENCE_BINDING"
},0);
