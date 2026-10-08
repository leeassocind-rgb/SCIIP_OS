#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,validPair} from "./M419D4APRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const aoPath=path.join(ev,"m4-19d4ao-controlled-single-google-geocode-evidence-read-coordinate-binding.json");
const boundPath=path.join(ev,"m4-19d4ao-bound-coordinate-evidence.json");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4ap-lightbox-point-read-preauthorization-using-bound-google-coordinates.json");
const manifestPath=path.join(ev,"m4-19d4ap-lightbox-point-read-preauthorization-manifest.json");
const auditPath=path.join(ev,"m4-19d4ap-lightbox-point-contract-binding-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      networkRequestsPerformed:0,lightBoxPointRequestsPerformed:0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
};

for(const p of [aoPath,boundPath,proxyPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AP_PREREQUISITE_MISSING",{path:p},3);
}
const ao=JSON.parse(fs.readFileSync(aoPath,"utf8"));
if(ao?.state!=="M419D4AO_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ_EXECUTED_COORDINATE_EVIDENCE_BOUND"){
  finish("BLOCKED","M419D4AP_AO_BOUND_COORDINATE_STATE_REQUIRED",{observed:ao?.state??null},3);
}
const bound=JSON.parse(fs.readFileSync(boundPath,"utf8"));

const lat=bound?.coordinateObservation?.latitude;
const lng=bound?.coordinateObservation?.longitude;
const canonicalPropertyId=bound?.boundIdentity?.canonicalPropertyId;
const sourcePropertyId=bound?.boundIdentity?.sourcePropertyId;
const address=bound?.certifiedAddress?.input;
const formattedProviderAddress=bound?.certifiedAddress?.formattedProviderAddress;

if(!validPair(lat,lng)||!canonicalPropertyId||!sourcePropertyId){
  finish("BLOCKED","M419D4AP_BOUND_COORDINATE_EVIDENCE_INVALID",{
    binding:{latitude:lat??null,longitude:lng??null,canonicalPropertyId:canonicalPropertyId??null,sourcePropertyId:sourcePropertyId??null}
  },3);
}

const proxy=fs.readFileSync(proxyPath,"utf8");
const hasByPointRoute=/url\.pathname\s*===\s*['"]\/api\/lightbox\/parcel\/by-point['"]\s*&&\s*req\.method\s*===\s*['"]GET['"]/i.test(proxy);
const hasLatQuery=/searchParams\.get\(['"]lat['"]\)/i.test(proxy);
const hasLngQuery=/searchParams\.get\(['"]lng['"]\)/i.test(proxy);
const callsParcelByPoint=/service\.parcelByPoint\s*\(/i.test(proxy);
const hasCountry=/countryCode/i.test(proxy);
const hasBufferDistance=/bufferDistance/i.test(proxy);
const hasBufferUnit=/bufferUnit/i.test(proxy);
const hasLimit=/limit/i.test(proxy);

if(!(hasByPointRoute&&hasLatQuery&&hasLngQuery&&callsParcelByPoint)){
  finish("BLOCKED","M419D4AP_LIGHTBOX_POINT_ROUTE_CONTRACT_NOT_PROVEN",{
    contractAudit:{hasByPointRoute,hasLatQuery,hasLngQuery,callsParcelByPoint}
  },3);
}

const query={
  lat:Number(lat),
  lng:Number(lng),
  bufferDistance:100,
  bufferUnit:"ft",
  limit:10,
  countryCode:"us"
};

const requestContract={
  transport:"LOCAL_LIGHTBOX_PROXY",
  method:"GET",
  route:"/api/lightbox/parcel/by-point",
  query,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  boundAddress:{input:address,providerFormattedAddress:formattedProviderAddress},
  coordinateEvidence:{
    source:"GOOGLE_MAPS_GEOCODING_API",
    evidencePath:boundPath,
    rawResponseSha256:bound?.coordinateObservation?.rawResponseSha256??null,
    observationTimestamp:bound?.coordinateObservation?.observationTimestamp??null,
    locationType:bound?.coordinateObservation?.locationType??null
  },
  responseQualification:{
    httpSuccessRequired:true,
    sourceNativeLightBoxParcelResponseRequired:true,
    parcelCandidatesRequired:true,
    providerProvenanceRequired:true,
    observationTimestampRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    addressCandidateScoringRequired:true,
    contradictoryAddressOrIdentityMustBlock:true
  },
  executionPolicy:{
    maximumLightBoxPointRequests:1,
    automaticRetry:false,
    executionAuthorized:false,
    explicitAuthorizationRequired:true
  }
};
const requestHash=sha(JSON.stringify(requestContract));

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AP_LIGHTBOX_POINT_READ_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  boundAddress:{input:address,providerFormattedAddress:formattedProviderAddress},
  boundCoordinates:{latitude:Number(lat),longitude:Number(lng)},
  requestContract,
  requestHash,
  executionAuthorized:false,
  maximumLightBoxPointRequests:1,
  automaticRetry:false
};
write(manifestPath,manifest);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AP_LIGHTBOX_POINT_CONTRACT_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  proxySource:proxyPath,
  routeContract:{
    hasByPointRoute,hasLatQuery,hasLngQuery,callsParcelByPoint,
    hasCountry,hasBufferDistance,hasBufferUnit,hasLimit
  },
  boundCoordinates:{latitude:Number(lat),longitude:Number(lng)},
  requestHash,
  networkRequestsPerformed:0
};
write(auditPath,audit);

finish("PASSED","M419D4AP_LIGHTBOX_POINT_READ_PREAUTHORIZED_USING_BOUND_GOOGLE_COORDINATES_EXECUTION_NOT_AUTHORIZED",{
  binding:{
    canonicalPropertyId,sourcePropertyId,address,
    latitude:Number(lat),longitude:Number(lng),
    method:"GET",route:"/api/lightbox/parcel/by-point",
    requestHash,
    maximumLightBoxPointRequests:1,
    executionAuthorized:false
  },
  policy:{
    boundGoogleCoordinateEvidenceRequired:true,
    exactPointRouteContractRequired:true,
    rawLightBoxResponseRequired:true,
    automaticRetry:false,
    explicitAuthorizationRequired:true
  },
  artifacts:{
    pointReadPreauthorizationManifest:manifestPath,
    pointContractBindingAudit:auditPath
  },
  nextMilestone:"M4.19D4AQ_CONTROLLED_SINGLE_LIGHTBOX_POINT_READ_EXECUTION_AND_PARCEL_EVIDENCE_QUALIFICATION"
},0);
