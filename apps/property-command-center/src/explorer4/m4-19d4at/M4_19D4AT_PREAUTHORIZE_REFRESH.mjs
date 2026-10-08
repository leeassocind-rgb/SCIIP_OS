#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,ageHours,freshnessClass,validAvailableSf} from "./M419D4ATRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const as4Path=path.join(ev,"m4-19d4as4-market-availability-refresh-source-freshness-contract-definition.json");
const sourceContractPath=path.join(ev,"m4-19d4as4-market-availability-refresh-source-contract.json");
const freshnessPath=path.join(ev,"m4-19d4as4-market-availability-freshness-policy.json");
const identityPath=path.join(ev,"m4-19d4ao-bound-coordinate-evidence.json");

const inputPath=path.join(ev,"m4-19d4at-single-record-availability-refresh-input.json");
const resultPath=path.join(ev,"m4-19d4at-market-availability-refresh-input-contract-single-record-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4at-single-record-refresh-preauthorization-manifest.json");
const templatePath=path.join(ev,"m4-19d4at-single-record-refresh-input-template.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const out={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
  automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,sourceMutationPerformed:false,processMutationPerformed:false,
  canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,
  operationalIngestionPerformed:false,availabilityObservationIngested:false,
  currentStatePromotionPerformed:false,syntheticTimestampUsed:false,automaticRetry:false
 }};
 write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
}

for(const p of [as4Path,sourceContractPath,freshnessPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AT_AS4_ARTIFACTS_REQUIRED",{missing:p},3);
}
const as4=JSON.parse(fs.readFileSync(as4Path,"utf8"));
if(as4.state!=="M419D4AS4_MARKET_AVAILABILITY_REFRESH_SOURCE_AND_FRESHNESS_CONTRACT_CERTIFIED_EXECUTION_NOT_AUTHORIZED"){
  finish("BLOCKED","M419D4AT_AS4_CERTIFIED_STATE_REQUIRED",{observed:as4.state},3);
}

let identity={
 canonicalPropertyId:"CPROP-0021AC235DED809E1821",
 sourcePropertyId:"PROPERTY-0021AC235DED809E1821",
 address:"14117-14123 Bessemer St"
};
if(fs.existsSync(identityPath)){
  try{
    const d=JSON.parse(fs.readFileSync(identityPath,"utf8"));
    identity={
      canonicalPropertyId:d?.canonicalPropertyId??d?.boundIdentity?.canonicalPropertyId??identity.canonicalPropertyId,
      sourcePropertyId:d?.sourcePropertyId??d?.boundIdentity?.sourcePropertyId??identity.sourcePropertyId,
      address:d?.address??d?.boundAddress?.input??identity.address
    };
  }catch{}
}

const template={
  contract:"SCIIP_EXPLORER_4_M4_19D4AT_SINGLE_RECORD_AVAILABILITY_REFRESH_INPUT",
  version:VERSION,
  canonicalPropertyId:identity.canonicalPropertyId,
  sourcePropertyId:identity.sourcePropertyId,
  address:identity.address,
  availableSf:null,
  provider:"",
  sourceType:"",
  sourceRecordIdOrStableReference:"",
  sourceNativeFieldPath:"",
  observationTimestamp:"",
  capturedAt:"",
  rawEvidenceReference:"",
  rawEvidenceHash:"",
  identityMatchEvidence:"",
  confidence:"",
  status:""
};
if(!fs.existsSync(inputPath)) write(inputPath,template);
write(templatePath,template);

const input=JSON.parse(fs.readFileSync(inputPath,"utf8"));
const failures=[];

if(input.canonicalPropertyId!==identity.canonicalPropertyId) failures.push("CANONICAL_PROPERTY_ID_MISMATCH");
if(input.sourcePropertyId && input.sourcePropertyId!==identity.sourcePropertyId) failures.push("SOURCE_PROPERTY_ID_MISMATCH");
if(!validAvailableSf(input.availableSf)) failures.push("VALID_AVAILABLE_SF_REQUIRED");
for(const f of ["provider","sourceType","sourceRecordIdOrStableReference","sourceNativeFieldPath","observationTimestamp","capturedAt","rawEvidenceReference","rawEvidenceHash","identityMatchEvidence","confidence","status"]){
  if(!String(input[f]??"").trim()) failures.push(`${f.toUpperCase()}_REQUIRED`);
}

const age=ageHours(input.observationTimestamp);
const freshness=freshnessClass(age);
if(freshness==="UNKNOWN") failures.push("VALID_OBSERVATION_TIMESTAMP_REQUIRED");
if(freshness==="STALE") failures.push("STALE_OBSERVATION_NOT_ELIGIBLE_FOR_CURRENT_REFRESH_PREAUTHORIZATION");

if(failures.length){
  finish("BLOCKED","M419D4AT_SINGLE_RECORD_REFRESH_INPUT_INCOMPLETE_OR_NOT_FRESH",{
    validation:{
      valid:false,failures,
      freshnessClass:freshness,
      ageHours:age,
      inputHash:sha(input)
    },
    operatorAction:{
      inputFile:inputPath,
      templateFile:templatePath,
      instruction:"Populate the refresh input with one real source-backed current availability observation. Do not invent timestamps or provenance."
    },
    nextMilestone:"M4.19D4AT_MARKET_AVAILABILITY_REFRESH_INPUT_CONTRACT_AND_SINGLE_RECORD_PREAUTHORIZATION"
  },3);
}

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AT_SINGLE_RECORD_REFRESH_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:identity,
  observation:{
    availableSf:Number(input.availableSf),
    provider:input.provider,
    sourceType:input.sourceType,
    sourceRecordIdOrStableReference:input.sourceRecordIdOrStableReference,
    sourceNativeFieldPath:input.sourceNativeFieldPath,
    observationTimestamp:input.observationTimestamp,
    capturedAt:input.capturedAt,
    rawEvidenceReference:input.rawEvidenceReference,
    rawEvidenceHash:input.rawEvidenceHash,
    identityMatchEvidence:input.identityMatchEvidence,
    confidence:input.confidence,
    status:input.status
  },
  freshness:{
    class:freshness,
    ageHours:age,
    eligibleForCurrentStatePreauthorization:freshness==="FRESH"||freshness==="AGING"
  },
  inputHash:sha(input),
  executionPolicy:{
    maximumRefreshExecutions:1,
    temporalAppendRequiredBeforeCurrentPromotion:true,
    currentStatePromotionNotAuthorized:true,
    automaticRetry:false,
    explicitAuthorizationRequired:true
  },
  executionAuthorized:false
};
write(manifestPath,manifest);

finish("PASSED","M419D4AT_SINGLE_RECORD_MARKET_AVAILABILITY_REFRESH_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  binding:{
    canonicalPropertyId:identity.canonicalPropertyId,
    sourcePropertyId:identity.sourcePropertyId,
    address:identity.address,
    availableSf:Number(input.availableSf),
    provider:input.provider,
    observationTimestamp:input.observationTimestamp,
    freshnessClass:freshness,
    ageHours:age,
    inputHash:sha(input),
    executionAuthorized:false
  },
  policy:{
    oneRefreshMaximum:true,
    temporalAppendBeforeCurrentStatePromotion:true,
    currentStatePromotionNotAuthorized:true,
    staleObservationBlocked:true,
    syntheticTimestampProhibited:true,
    automaticRetry:false
  },
  artifacts:{
    refreshInput:inputPath,
    preauthorizationManifest:manifestPath
  },
  nextMilestone:"M4.19D4AU_CONTROLLED_SINGLE_MARKET_AVAILABILITY_REFRESH_OBSERVATION_APPEND"
});
