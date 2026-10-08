#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,norm} from "./M419D4AVRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const auPath=path.join(ev,"m4-19d4au-controlled-single-market-availability-refresh-observation-append.json");
const auditPath=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const resultPath=path.join(ev,"m4-19d4av-current-state-promotion-preauthorization.json");
const bindingAuditPath=path.join(ev,"m4-19d4av-current-state-binding-audit.json");
const promotionManifestPath=path.join(ev,"m4-19d4av-current-state-promotion-preauthorization-manifest.json");

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
  networkRequestsPerformed:0,
  currentStateMutationPerformed:false,
  temporalMutationPerformed:false,
  canonicalMutationPerformed:false,
  identityMutationPerformed:false,
  downstreamMaterializationPerformed:false,
  automaticRetry:false
 }};
 write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
}

for(const p of [auPath,auditPath,inventoryPath]){
 if(!fs.existsSync(p)) finish("BLOCKED","M419D4AV_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}

const au=JSON.parse(fs.readFileSync(auPath,"utf8"));
if(au.state!=="M419D4AU_SINGLE_MARKET_AVAILABILITY_TEMPORAL_OBSERVATION_APPENDED_CURRENT_STATE_PROMOTION_NOT_AUTHORIZED"){
 finish("BLOCKED","M419D4AV_AU_CERTIFIED_TEMPORAL_APPEND_STATE_REQUIRED",{observed:au.state},3);
}

const appendAudit=JSON.parse(fs.readFileSync(auditPath,"utf8"));
const obs=appendAudit.appendedObservation;
const invText=fs.readFileSync(inventoryPath,"utf8");
const inv=JSON.parse(invText);

const records=Array.isArray(inv)?inv:(Array.isArray(inv.records)?inv.records:(Array.isArray(inv.properties)?inv.properties:[]));
if(!records.length){
 finish("BLOCKED","M419D4AV_GOVERNED_BASE_INVENTORY_RECORD_ARRAY_NOT_RECOVERED",{},3);
}

const cid=obs.canonicalPropertyId;
const sid=obs.sourcePropertyId;
const addr=norm(obs.address);

const matches=records.map((r,i)=>({r,i})).filter(({r})=>{
 const ids=[r.canonicalPropertyId,r.propertyId,r.sourcePropertyId,r.id].map(norm);
 const a=norm(r.address ?? r.streetAddress ?? r.fullAddress);
 return ids.includes(norm(cid)) || ids.includes(norm(sid)) || (a && addr && a===addr);
});

if(matches.length===0){
 finish("BLOCKED","M419D4AV_NO_CURRENT_STATE_RECORD_MATCH_FOR_CERTIFIED_OBSERVATION",{
  canonicalPropertyId:cid,sourcePropertyId:sid,address:obs.address
 },3);
}
if(matches.length>1){
 finish("BLOCKED","M419D4AV_MULTIPLE_CURRENT_STATE_RECORD_MATCHES_REQUIRE_RECONCILIATION",{
  matchCount:matches.length,
  matchedIndices:matches.map(x=>x.i)
 },3);
}

const {r:record,i:index}=matches[0];

const availableSfPath = Object.prototype.hasOwnProperty.call(record,"availableSf") ? `records[${index}].availableSf`
 : Object.prototype.hasOwnProperty.call(record,"availableSF") ? `records[${index}].availableSF`
 : null;

if(!availableSfPath){
 finish("BLOCKED","M419D4AV_CURRENT_STATE_AVAILABLE_SF_FIELD_NOT_FOUND",{
  matchedIndex:index,
  matchedKeys:Object.keys(record)
 },3);
}

const currentValue = record.availableSf ?? record.availableSF ?? null;
const currentTimestamp = record.observationTimestamp ?? record.availableSfObservationTimestamp ?? record.updatedAt ?? record.asOf ?? null;

let conflict="NONE";
if(currentTimestamp){
 const cur=new Date(currentTimestamp);
 const next=new Date(obs.observationTimestamp);
 if(!Number.isNaN(cur.getTime()) && !Number.isNaN(next.getTime())){
  if(cur.getTime()>next.getTime()) conflict="CURRENT_STATE_NEWER_THAN_CERTIFIED_OBSERVATION";
  else if(cur.getTime()===next.getTime() && Number(currentValue)!==Number(obs.value)) conflict="SAME_TIMESTAMP_VALUE_CONFLICT";
 }
}

if(conflict!=="NONE"){
 finish("BLOCKED","M419D4AV_CURRENT_STATE_CONFLICT_REQUIRES_RECONCILIATION",{
  conflict,
  currentState:{availableSf:currentValue,timestamp:currentTimestamp},
  certifiedObservation:{availableSf:obs.value,timestamp:obs.observationTimestamp}
 },3);
}

const bindingAudit={
 contract:"SCIIP_EXPLORER_4_M4_19D4AV_CURRENT_STATE_BINDING_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 inventoryPath,inventorySha256:sha(invText),
 matchedRecordIndex:index,
 exactBinding:{
  canonicalPropertyId:cid,
  sourcePropertyId:sid,
  address:obs.address,
  matched:true
 },
 currentState:{
  availableSfPath,
  currentAvailableSf:currentValue,
  currentTimestamp
 },
 certifiedObservation:{
  observationId:obs.observationId,
  availableSf:obs.value,
  observationTimestamp:obs.observationTimestamp,
  provider:obs.provider,
  freshnessClass:obs.freshnessClass
 },
 conflict
};
write(bindingAuditPath,bindingAudit);

const promotion={
 contract:"SCIIP_EXPLORER_4_M4_19D4AV_CURRENT_STATE_PROMOTION_PREAUTHORIZATION_MANIFEST",
 version:VERSION,generatedAt:new Date().toISOString(),
 inventoryPath,
 inventorySha256Before:sha(invText),
 matchedRecordIndex:index,
 availableSfFieldPath:availableSfPath,
 before:{
  availableSf:currentValue,
  observationTimestamp:currentTimestamp
 },
 after:{
  availableSf:obs.value,
  observationTimestamp:obs.observationTimestamp,
  provider:obs.provider,
  observationId:obs.observationId,
  freshnessClass:obs.freshnessClass
 },
 mutationPolicy:{
  maximumCurrentStateMutations:1,
  onlyAvailableSfAndAssociatedAvailabilityMetadata:true,
  identityFieldsImmutable:true,
  temporalHistoryImmutable:true,
  downstreamPropagationNotAuthorized:true,
  automaticRetry:false
 },
 executionAuthorized:false
};
write(promotionManifestPath,promotion);

finish("PASSED","M419D4AV_CURRENT_STATE_PROMOTION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
 binding:{
  canonicalPropertyId:cid,
  sourcePropertyId:sid,
  address:obs.address,
  matchedRecordIndex:index,
  availableSfFieldPath:availableSfPath,
  currentAvailableSf:currentValue,
  proposedAvailableSf:obs.value,
  certifiedObservationId:obs.observationId,
  observationTimestamp:obs.observationTimestamp,
  freshnessClass:obs.freshnessClass,
  conflict:"NONE",
  executionAuthorized:false
 },
 policy:{
  singleCurrentStateMutationMaximum:true,
  exactIdentityBindingRequired:true,
  newerCurrentStateBlocksPromotion:true,
  sameTimestampContradictionBlocksPromotion:true,
  currentStateMutationNotPerformed:true,
  downstreamPropagationNotAuthorized:true
 },
 artifacts:{
  currentStateBindingAudit:bindingAuditPath,
  promotionPreauthorizationManifest:promotionManifestPath
 },
 nextMilestone:"M4.19D4AW_CONTROLLED_SINGLE_CURRENT_STATE_AVAILABLE_SF_PROMOTION"
});
