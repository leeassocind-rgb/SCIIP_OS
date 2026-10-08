#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,classifyGoogle} from "./M419D4AKRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const ajPath=path.join(ev,"m4-19d4aj-controlled-single-geocode-execution-coordinate-evidence-binding.json");
const rawPath=path.join(ev,"m4-19d4aj-geocode-raw-response.json");
const ah7Path=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");

const resultPath=path.join(ev,"m4-19d4ak-geocode-response-forensics-alternate-resolution-path.json");
const auditPath=path.join(ev,"m4-19d4ak-geocode-response-forensic-audit.json");
const planPath=path.join(ev,"m4-19d4ak-alternate-coordinate-resolution-plan.json");

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
      networkRequestsPerformed:0,geocodeRequestsPerformed:0,enrichmentRequestsPerformed:0,
      sourceMutationPerformed:false,processMutationPerformed:false,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [ajPath,rawPath,ah7Path]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AK_PREREQUISITE_MISSING",{path:p},3);
}
const aj=JSON.parse(fs.readFileSync(ajPath,"utf8"));
if(aj?.state!=="M419D4AJ_GEOCODE_RESPONSE_NOT_QUALIFIED"){
  finish("BLOCKED","M419D4AK_EXPECTED_AJ_NOT_QUALIFIED_STATE",{observed:aj?.state??null},3);
}
let raw={}; try{raw=JSON.parse(fs.readFileSync(rawPath,"utf8"))}catch{}
const locator=JSON.parse(fs.readFileSync(ah7Path,"utf8"));

const classification=classifyGoogle(raw,aj?.httpStatus??null);
const apiNotEnabled=classification==="GOOGLE_GEOCODING_API_NOT_ENABLED";

const alternatePaths=[
  {
    mode:"ENABLE_EXISTING_GOOGLE_GEOCODING_API",
    qualified:apiNotEnabled,
    requiresOperatorCloudConfiguration:true,
    requiresNewCredential:false,
    requiresNewSourceCode:false,
    notes:"Existing Google Maps credential reached Google successfully; project capability is missing."
  },
  {
    mode:"LIGHTBOX_ADDRESS_OR_IDENTIFIER_RESOLUTION",
    qualified:true,
    requiresOperatorCloudConfiguration:false,
    requiresNewCredential:false,
    requiresExistingLightBoxServerCredential:true,
    notes:"Prefer existing server-side LightBox stack if repository implementation proves address/identifier resolution semantics."
  }
];

const selectedPath=apiNotEnabled
  ? "LIGHTBOX_ADDRESS_OR_IDENTIFIER_RESOLUTION_FORENSICS_FIRST"
  : "PROVIDER_SPECIFIC_RECOVERY_REQUIRED";

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AK_GEOCODE_RESPONSE_FORENSIC_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  ajState:aj?.state??null,
  httpStatus:aj?.httpStatus??null,
  providerStatus:aj?.providerStatus??raw?.status??null,
  providerErrorMessage:aj?.providerErrorMessage??raw?.error_message??null,
  classification,
  address:locator?.locator?.address??null,
  googleRequestReachedProvider:aj?.httpStatus===200,
  credentialRejected:false,
  geocodingApiCapabilityMissing:apiNotEnabled,
  networkRequestsPerformed:0
};
write(auditPath,audit);

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4AK_ALTERNATE_COORDINATE_RESOLUTION_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:locator?.boundIdentity??null,
  certifiedAddress:locator?.locator?.address??null,
  priorFailureClassification:classification,
  paths:alternatePaths,
  selectedPath,
  policy:{
    noBlindGoogleRetry:true,
    doNotRotateCredentialsWithoutEvidence:true,
    doNotEnableCloudApiAutomatically:true,
    inspectExistingLightBoxAddressResolutionBeforeOperatorCloudChange:true,
    oneFutureExternalCoordinateRequestMaximum:true,
    rawEvidenceRequired:true,
    automaticRetry:false
  }
};
write(planPath,plan);

let state,next;
if(apiNotEnabled){
  state="M419D4AK_GOOGLE_GEOCODING_API_NOT_ENABLED_ALTERNATE_LIGHTBOX_RESOLUTION_FORENSICS_SELECTED";
  next="M4.19D4AL_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_CAPABILITY_FORENSICS";
}else{
  state="M419D4AK_GEOCODE_FAILURE_CLASSIFIED_PROVIDER_SPECIFIC_RECOVERY_REQUIRED";
  next="M4.19D4AL_PROVIDER_SPECIFIC_GEOCODE_RECOVERY_POLICY";
}

finish("PASSED",state,{
  forensics:{
    classification,
    httpStatus:aj?.httpStatus??null,
    providerStatus:aj?.providerStatus??raw?.status??null,
    providerErrorMessage:aj?.providerErrorMessage??raw?.error_message??null,
    googleRequestReachedProvider:aj?.httpStatus===200,
    geocodingApiCapabilityMissing:apiNotEnabled,
    certifiedAddress:locator?.locator?.address??null
  },
  recoveryPolicy:{
    blindRetryProhibited:true,
    automaticCloudApiEnablementProhibited:true,
    credentialRotationNotIndicated:true,
    existingLightBoxResolutionCapabilityShouldBeInspectedFirst:apiNotEnabled,
    googleApiEnablementRemainsOperatorOption:apiNotEnabled
  },
  artifacts:{forensicAudit:auditPath,alternateResolutionPlan:planPath},
  nextMilestone:next
},0);
