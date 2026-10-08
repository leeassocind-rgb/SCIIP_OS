#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha} from "./M419D4AURuntime.js";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const atPath=path.join(ev,"m4-19d4at-market-availability-refresh-input-contract-single-record-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4at-single-record-refresh-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4au-controlled-single-market-availability-refresh-observation-append.json");
const temporalPath=path.join(ev,"m4-19d4au-market-availability-temporal-observations.jsonl");
const appendAuditPath=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const out={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{
  temporalWriteAuthority:status==="PASSED",
  canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:status==="PASSED",
  refreshExecutionAuthority:false,operationalIngestionAuthority:false,
  syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,
  maximumObservationAppends:1,
  currentStatePromotionPerformed:false,
  canonicalMutationPerformed:false,
  identityMutationPerformed:false,
  operationalIngestionPerformed:false,
  automaticRetry:false
 }};
 write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
}

if(auth!=="AUTHORIZE_M419D4AU_SINGLE_AVAILABILITY_OBSERVATION_APPEND"){
 finish("BLOCKED","M419D4AU_EXPLICIT_APPEND_AUTHORIZATION_REQUIRED",{providedAuthorization:auth||null},3);
}
for(const p of [atPath,manifestPath]){
 if(!fs.existsSync(p)) finish("BLOCKED","M419D4AU_AT_PREAUTHORIZATION_ARTIFACTS_REQUIRED",{missing:p},3);
}
const at=JSON.parse(fs.readFileSync(atPath,"utf8"));
const man=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
if(at.state!=="M419D4AT_SINGLE_RECORD_MARKET_AVAILABILITY_REFRESH_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED"){
 finish("BLOCKED","M419D4AU_AT_PREAUTHORIZED_STATE_REQUIRED",{observed:at.state},3);
}

const observation={
 observationId:"AVAILOBS-"+sha({
  canonicalPropertyId:man.boundIdentity.canonicalPropertyId,
  observationTimestamp:man.observation.observationTimestamp,
  provider:man.observation.provider,
  availableSf:man.observation.availableSf,
  sourceReference:man.observation.sourceRecordIdOrStableReference
 }).slice(0,24).toUpperCase(),
 canonicalPropertyId:man.boundIdentity.canonicalPropertyId,
 sourcePropertyId:man.boundIdentity.sourcePropertyId,
 address:man.boundIdentity.address,
 field:"availableSf",
 value:man.observation.availableSf,
 unit:"SF",
 semanticType:"MARKET_AVAILABILITY",
 provider:man.observation.provider,
 sourceType:man.observation.sourceType,
 sourceRecordIdOrStableReference:man.observation.sourceRecordIdOrStableReference,
 sourceNativeFieldPath:man.observation.sourceNativeFieldPath,
 observationTimestamp:man.observation.observationTimestamp,
 capturedAt:man.observation.capturedAt,
 rawEvidenceReference:man.observation.rawEvidenceReference,
 rawEvidenceHash:man.observation.rawEvidenceHash,
 identityMatchEvidence:man.observation.identityMatchEvidence,
 confidence:man.observation.confidence,
 status:man.observation.status,
 freshnessClass:man.freshness.class,
 freshnessAgeHoursAtPreauthorization:man.freshness.ageHours,
 inputHash:man.inputHash,
 appendedAt:new Date().toISOString()
};

let prior=[];
if(fs.existsSync(temporalPath)){
 try{
  prior=fs.readFileSync(temporalPath,"utf8").split("\n").filter(Boolean).map(x=>JSON.parse(x));
 }catch(e){
  finish("BLOCKED","M419D4AU_EXISTING_TEMPORAL_OBSERVATION_LOG_NOT_PARSEABLE",{error:e.message},3);
 }
}
const duplicate=prior.find(x=>x.observationId===observation.observationId);
if(duplicate){
 finish("BLOCKED","M419D4AU_DUPLICATE_OBSERVATION_APPEND_PROHIBITED",{duplicateObservationId:observation.observationId},3);
}

fs.appendFileSync(temporalPath,JSON.stringify(observation)+"\n");
const lineCount=fs.readFileSync(temporalPath,"utf8").split("\n").filter(Boolean).length;

const audit={
 contract:"SCIIP_EXPLORER_4_M4_19D4AU_MARKET_AVAILABILITY_OBSERVATION_APPEND_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 observationId:observation.observationId,
 temporalLogPath:temporalPath,
 temporalLogSha256:sha(fs.readFileSync(temporalPath,"utf8")),
 temporalObservationCount:lineCount,
 appendedObservation:observation,
 currentStatePromotionPerformed:false
};
write(appendAuditPath,audit);

finish("PASSED","M419D4AU_SINGLE_MARKET_AVAILABILITY_TEMPORAL_OBSERVATION_APPENDED_CURRENT_STATE_PROMOTION_NOT_AUTHORIZED",{
 execution:{
  observationAppendsPerformed:1,
  observationId:observation.observationId,
  canonicalPropertyId:observation.canonicalPropertyId,
  availableSf:observation.value,
  provider:observation.provider,
  observationTimestamp:observation.observationTimestamp,
  freshnessClass:observation.freshnessClass,
  currentStatePromotionPerformed:false
 },
 policy:{
  appendOnlyTemporalHistory:true,
  duplicateAppendProhibited:true,
  oneObservationMaximum:true,
  currentStatePromotionRequiresSeparateAuthorization:true,
  downstreamMaterializationNotAuthorized:true
 },
 artifacts:{
  temporalObservationLog:temporalPath,
  appendAudit:appendAuditPath
 },
 nextMilestone:"M4.19D4AV_CURRENT_STATE_PROMOTION_PREAUTHORIZATION_FROM_CERTIFIED_TEMPORAL_AVAILABILITY_OBSERVATION"
});
