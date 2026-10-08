#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION} from "./M419D4AR2Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const arPath=path.join(ev,"m4-19d4ar-source-native-available-sf-path-qualification.json");
const aq2Path=path.join(ev,"m4-19d4aq2-qualified-lightbox-parcel-evidence.json");
const resultPath=path.join(ev,"m4-19d4ar2-lightbox-parcel-only-capability-closure-market-availability-source-separation.json");
const boundaryPath=path.join(ev,"m4-19d4ar2-source-authority-boundary-manifest.json");
const handoffPath=path.join(ev,"m4-19d4ar2-market-availability-source-handoff-contract.json");

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
      networkRequestsPerformed:0,
      enrichmentRequestsPerformed:0,
      sourceMutationPerformed:false,
      processMutationPerformed:false,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      lightBoxAvailabilityInferencePerformed:false,
      syntheticAvailabilityUsed:false,
      automaticRetry:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [arPath,aq2Path]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AR2_PREREQUISITE_MISSING",{path:p},3);
}

const ar=JSON.parse(fs.readFileSync(arPath,"utf8"));
if(ar?.state!=="M419D4AR_SOURCE_NATIVE_AVAILABLE_SF_NOT_PRESENT_IN_QUALIFIED_PARCEL_RESPONSE"){
  finish("BLOCKED","M419D4AR2_AR_NO_AVAILABILITY_STATE_REQUIRED",{observed:ar?.state??null},3);
}
const aq2=JSON.parse(fs.readFileSync(aq2Path,"utf8"));

const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const proxy=fs.existsSync(proxyPath)?fs.readFileSync(proxyPath,"utf8"):"";

const parcelRoutes=[...proxy.matchAll(/['"`](\/api\/lightbox\/parcel\/[^'"`]+)['"`]/g)].map(m=>m[1]);
const enrichRoute=/\/api\/lightbox\/enrich/.test(proxy);
const parcelSemantics=/parcelByPoint|parcel\/resolve|parcel\/by-point|parcels\.geometry/i.test(proxy);
const marketAvailabilitySemantics=/availableSf|availability|listing|vacancy|available\s+space/i.test(proxy);

const boundary={
  contract:"SCIIP_EXPLORER_4_M4_19D4AR2_SOURCE_AUTHORITY_BOUNDARY_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:aq2?.boundIdentity??null,
  lightBoxAuthority:{
    role:"PARCEL_AND_PROPERTY_INTELLIGENCE_PROVIDER",
    authoritativeFor:[
      "parcel geometry",
      "parcel identity candidates",
      "parcel address evidence",
      "parcel-related source-native attributes exposed by its parcel contracts"
    ],
    notAuthoritativeFor:[
      "market availability",
      "availableSf",
      "active marketing status",
      "lease availability",
      "listing inventory",
      "vacancy represented as market availability"
    ]
  },
  marketAvailabilityAuthority:{
    role:"SEPARATE_SOURCE_REQUIRED",
    requiredCapabilities:[
      "source-native availability observation",
      "observation timestamp",
      "stable source provenance",
      "property identity/address binding",
      "availableSf semantic definition",
      "no substitution from building area or parcel attributes"
    ]
  },
  policy:{
    lightBoxParcelResponseCannotSynthesizeAvailableSf:true,
    lightBoxPhysicalAreaCannotSubstituteForAvailableSf:true,
    absenceOfAvailabilityInLightBoxIsNotZeroAvailability:true,
    marketAvailabilityMustComeFromSeparateProviderOrOperatorSource:true
  }
};
write(boundaryPath,boundary);

const handoff={
  contract:"SCIIP_EXPLORER_4_M4_19D4AR2_MARKET_AVAILABILITY_SOURCE_HANDOFF_CONTRACT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  inputIdentity:{
    canonicalPropertyId:aq2?.boundIdentity?.canonicalPropertyId??null,
    sourcePropertyId:aq2?.boundIdentity?.sourcePropertyId??null,
    address:aq2?.boundAddress?.input??null,
    latitude:aq2?.boundCoordinates?.latitude??null,
    longitude:aq2?.boundCoordinates?.longitude??null
  },
  requiredObservation:{
    field:"availableSf",
    semanticType:"MARKET_AVAILABILITY",
    requiredMetadata:[
      "provider",
      "sourceRecordIdOrStableReference",
      "observationTimestamp",
      "sourceNativeFieldPath",
      "rawEvidenceReference",
      "rawEvidenceHash",
      "identityMatchEvidence"
    ]
  },
  acceptableSourceFamilies:[
    "MARKET_LISTING_PROVIDER",
    "BROKERAGE_OR_OPERATOR_AVAILABILITY_FEED",
    "OWNER_OR_PROPERTY_MANAGER_SOURCE",
    "GOVERNED_OPERATOR_ATTESTATION_WITH_SUPPORTING_EVIDENCE"
  ],
  prohibitedSubstitutions:[
    "buildingSf",
    "grossBuildingArea",
    "gla",
    "parcelArea",
    "improvementArea",
    "canonicalFallbackWithoutFreshSourceEvidence",
    "temporalFallbackWithoutFreshSourceEvidence"
  ],
  executionAuthorized:false
};
write(handoffPath,handoff);

finish("PASSED","M419D4AR2_LIGHTBOX_PARCEL_ONLY_CAPABILITY_BOUNDARY_CERTIFIED_MARKET_AVAILABILITY_SEPARATE_SOURCE_REQUIRED",{
  closure:{
    classification:"LIGHTBOX_IS_PARCEL_PROPERTY_INTELLIGENCE_NOT_MARKET_AVAILABILITY_PROVIDER",
    parcelRoutes:[...new Set(parcelRoutes)],
    enrichRoutePresent:enrichRoute,
    parcelSemanticsPresent:parcelSemantics,
    marketAvailabilitySemanticsPresentInProxy:marketAvailabilitySemantics,
    arQualifiedAvailableSf:false,
    lightBoxAvailabilityBranchClosed:true
  },
  sourceAuthority:{
    lightBoxRole:"PARCEL_AND_PROPERTY_INTELLIGENCE",
    marketAvailabilityRole:"SEPARATE_SOURCE_REQUIRED"
  },
  policy:{
    futureLightBoxAvailableSfExtractionAttemptsProhibited:true,
    buildingAreaSubstitutionProhibited:true,
    missingAvailabilityDoesNotMeanZero:true,
    separateAvailabilityProviderRequired:true
  },
  artifacts:{
    sourceAuthorityBoundaryManifest:boundaryPath,
    marketAvailabilitySourceHandoffContract:handoffPath
  },
  nextMilestone:"M4.19D4AS_MARKET_AVAILABILITY_SOURCE_AUTHORITY_SELECTION_AND_CONTRACT_DEFINITION"
},0);
