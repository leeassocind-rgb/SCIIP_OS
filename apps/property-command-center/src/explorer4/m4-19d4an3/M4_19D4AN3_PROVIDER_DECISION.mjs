#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,scoreOption} from "./M419D4AN3Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const an2Path=path.join(ev,"m4-19d4an2-lightbox-internal-address-resolution-factory-provider-contract-forensics.json");
const akPath=path.join(ev,"m4-19d4ak-geocode-response-forensics-alternate-resolution-path.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");

const resultPath=path.join(ev,"m4-19d4an3-external-geocoder-google-enablement-decision.json");
const decisionPath=path.join(ev,"m4-19d4an3-coordinate-provider-decision-manifest.json");

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

for(const p of [an2Path,akPath,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AN3_PREREQUISITE_MISSING",{path:p},3);
}

const an2=JSON.parse(fs.readFileSync(an2Path,"utf8"));
if(an2?.state!=="M419D4AN2_ADDRESS_SEMANTICS_CONFIRMED_AS_POST_FETCH_SCORING_NOT_PROVIDER_LOCATOR"){
  finish("BLOCKED","M419D4AN3_AN2_POST_FETCH_SCORING_STATE_REQUIRED",{observed:an2?.state??null},3);
}
const ak=JSON.parse(fs.readFileSync(akPath,"utf8"));
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));

const options=[
  {
    id:"GOOGLE_GEOCODING_ENABLEMENT",
    provider:"Google Maps Geocoding API",
    existingCredential:true,
    existingAppDependency:true,
    noNewVendor:true,
    sourceNativeCoordinates:true,
    requiresCloudEnablement:true,
    requiresNewCredential:false,
    requiresNewVendor:false,
    knownCondition:ak?.forensics?.classification??null,
    notes:"Prior governed request reached Google and was denied only because Geocoding API is not enabled."
  },
  {
    id:"NEW_EXTERNAL_GEOCODER",
    provider:"Unselected external geocoder",
    existingCredential:false,
    existingAppDependency:false,
    noNewVendor:false,
    sourceNativeCoordinates:true,
    requiresCloudEnablement:false,
    requiresNewCredential:true,
    requiresNewVendor:true,
    knownCondition:"NOT_CONFIGURED",
    notes:"Would add a new provider, credential, contract and governance surface."
  },
  {
    id:"LIGHTBOX_POINT_LOOKUP",
    provider:"LightBox parcel-by-point",
    existingCredential:true,
    existingAppDependency:true,
    noNewVendor:true,
    sourceNativeCoordinates:false,
    requiresCloudEnablement:false,
    requiresNewCredential:false,
    requiresNewVendor:false,
    knownCondition:"POINT_INPUT_REQUIRED",
    notes:"Not a geocoder; cannot resolve address to coordinates."
  }
].map(o=>({...o,score:scoreOption(o)}));

options.sort((a,b)=>b.score-a.score);
const selected=options.find(o=>o.id==="GOOGLE_GEOCODING_ENABLEMENT");

const decision={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN3_COORDINATE_PROVIDER_DECISION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:locator?.boundIdentity??null,
  certifiedAddress:locator?.locator?.address??null,
  closedBranches:{
    lightBoxAddressGeocoder:false,
    lightBoxAddressSemantics:"POST_FETCH_SCORING_ONLY",
    lightBoxPointLookupRequiresCoordinates:true
  },
  options,
  selectedOption:selected,
  rationale:[
    "Existing Google credential already reaches Google successfully.",
    "Google Maps is already an application dependency.",
    "Only the Geocoding API capability is missing.",
    "No new vendor or credential is required.",
    "LightBox remains the downstream parcel resolver after coordinates are obtained."
  ],
  executionPolicy:{
    cloudConfigurationMutationAuthorized:false,
    geocodeExecutionAuthorized:false,
    explicitOperatorEnablementRequired:true,
    postEnablementSingleRequestPreauthorizationRequired:true,
    automaticRetry:false
  }
};
write(decisionPath,decision);

finish("PASSED","M419D4AN3_GOOGLE_GEOCODING_ENABLEMENT_SELECTED_OPERATOR_CLOUD_CONFIGURATION_REQUIRED",{
  decision:{
    classification:"GOOGLE_GEOCODING_IS_PREFERRED_COORDINATE_PROVIDER",
    certifiedAddress:locator?.locator?.address??null,
    selectedOption:selected,
    alternatives:options.filter(o=>o.id!==selected.id)
  },
  policy:{
    lightBoxAddressGeocoderBranchClosed:true,
    googleCredentialRotationNotRequired:true,
    newExternalVendorNotPreferred:true,
    automaticCloudMutation:false,
    operatorEnablementRequired:true,
    noNetworkRequest:true,
    automaticRetry:false
  },
  operatorAction:{
    action:"ENABLE_GOOGLE_MAPS_GEOCODING_API_ON_EXISTING_PROJECT",
    note:"Enable the Geocoding API for the same Google Cloud project/key already used by SCIIP. Do not create or rotate credentials unless Google Cloud policy requires it.",
    nextAfterEnablement:"M4.19D4AN4_GOOGLE_GEOCODING_ENABLEMENT_VERIFICATION_AND_SINGLE_READ_REPREAUTHORIZATION"
  },
  artifacts:{coordinateProviderDecisionManifest:decisionPath},
  nextMilestone:"M4.19D4AN4_GOOGLE_GEOCODING_ENABLEMENT_VERIFICATION_AND_SINGLE_READ_REPREAUTHORIZATION"
},0);
