#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,norm,flatten} from "./M419D4AV1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const avPath=path.join(ev,"m4-19d4av-current-state-promotion-preauthorization.json");
const auAuditPath=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const resultPath=path.join(ev,"m4-19d4av1-governed-base-inventory-record-identity-reconciliation.json");
const auditPath=path.join(ev,"m4-19d4av1-governed-base-inventory-identity-reconciliation-audit.json");
const bindingPath=path.join(ev,"m4-19d4av1-current-state-record-binding-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const o={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
  automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,currentStateMutationPerformed:false,temporalMutationPerformed:false,
  canonicalMutationPerformed:false,identityMutationPerformed:false,downstreamMaterializationPerformed:false,
  syntheticIdentityUsed:false,automaticRetry:false
 }};
 write(resultPath,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}

for(const p of [avPath,auAuditPath,inventoryPath]){
 if(!fs.existsSync(p)) finish("BLOCKED","M419D4AV1_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const av=JSON.parse(fs.readFileSync(avPath,"utf8"));
if(av.state!=="M419D4AV_NO_CURRENT_STATE_RECORD_MATCH_FOR_CERTIFIED_OBSERVATION"){
 finish("BLOCKED","M419D4AV1_AV_NO_MATCH_STATE_REQUIRED",{observed:av.state},3);
}
const auAudit=JSON.parse(fs.readFileSync(auAuditPath,"utf8"));
const obs=auAudit.appendedObservation;
const invText=fs.readFileSync(inventoryPath,"utf8");
const inv=JSON.parse(invText);

function recoverRecords(doc){
 if(Array.isArray(doc)) return {records:doc,containerPath:"$"};
 for(const k of ["records","properties","items","features","inventory","data"]){
  if(Array.isArray(doc?.[k])) return {records:doc[k],containerPath:`$.${k}`};
 }
 const topArrays=Object.entries(doc||{}).filter(([,v])=>Array.isArray(v));
 if(topArrays.length===1) return {records:topArrays[0][1],containerPath:`$.${topArrays[0][0]}`};
 return {records:[],containerPath:null};
}
const {records,containerPath}=recoverRecords(inv);
if(!records.length) finish("BLOCKED","M419D4AV1_INVENTORY_RECORD_CONTAINER_NOT_RECOVERED",{topLevelKeys:Object.keys(inv||{})},3);

const cid=norm(obs.canonicalPropertyId);
const sid=norm(obs.sourcePropertyId);
const addr=norm(obs.address);
const addrFirst=norm(String(obs.address||"").split("-")[0]);
const targetTokens=[cid,sid,addr,addrFirst].filter(Boolean);

const scored=records.map((r,index)=>{
 const flat=flatten(r);
 let score=0;
 const evidence=[];
 for(const e of flat){
  if(typeof e.value!=="string" && typeof e.value!=="number") continue;
  const v=norm(e.value);
  if(!v) continue;
  if(cid && v===cid){score+=100;evidence.push({type:"CANONICAL_ID_EXACT",path:e.path,value:e.value});}
  if(sid && v===sid){score+=90;evidence.push({type:"SOURCE_ID_EXACT",path:e.path,value:e.value});}
  if(addr && v===addr){score+=80;evidence.push({type:"ADDRESS_EXACT",path:e.path,value:e.value});}
  if(addr && (v.includes(addr)||addr.includes(v)) && Math.min(v.length,addr.length)>=10){
    score+=30;evidence.push({type:"ADDRESS_CONTAINS",path:e.path,value:e.value});
  }
  const digitsT=(addr.match(/\d+/g)||[]).slice(0,2);
  const digitsV=(v.match(/\d+/g)||[]);
  if(digitsT.length && digitsT.some(d=>digitsV.includes(d))){
    if(/address|street|site|location/i.test(e.key)){score+=12;evidence.push({type:"STREET_NUMBER_MATCH",path:e.path,value:e.value});}
  }
 }
 return {
  index,score,evidence:evidence.slice(0,30),
  availableSfPresent:Object.prototype.hasOwnProperty.call(r,"availableSf")||Object.prototype.hasOwnProperty.call(r,"availableSF"),
  topLevelKeys:Object.keys(r).slice(0,60)
 };
}).sort((a,b)=>b.score-a.score||a.index-b.index);

const positive=scored.filter(x=>x.score>0);
const top=positive[0]??null;
const second=positive[1]??null;
const uniqueStrong=!!(top && top.score>=80 && (!second || top.score>second.score));

write(auditPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AV1_GOVERNED_BASE_INVENTORY_IDENTITY_RECONCILIATION_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 inventoryPath,inventorySha256:sha(invText),containerPath,
 target:{
  canonicalPropertyId:obs.canonicalPropertyId,
  sourcePropertyId:obs.sourcePropertyId,
  address:obs.address
 },
 recordCount:records.length,
 positiveCandidateCount:positive.length,
 topCandidates:positive.slice(0,25),
 uniqueStrongMatch:uniqueStrong
});

if(!uniqueStrong){
 finish("PASSED","M419D4AV1_NO_UNIQUE_STRONG_CURRENT_STATE_RECORD_BINDING_RECOVERED_FURTHER_IDENTITY_LINEAGE_REQUIRED",{
  reconciliation:{
   recordCount:records.length,
   positiveCandidateCount:positive.length,
   topCandidates:positive.slice(0,10)
  },
  artifacts:{identityReconciliationAudit:auditPath},
  nextMilestone:"M4.19D4AV2_CANONICAL_TO_GOVERNED_BASE_INVENTORY_IDENTITY_LINEAGE_FORENSICS"
 });
}

const record=records[top.index];
let availableField=null;
for(const k of ["availableSf","availableSF","available_sf"]){
 if(Object.prototype.hasOwnProperty.call(record,k)){availableField=k;break;}
}
if(!availableField){
 const flat=flatten(record);
 const e=flat.find(x=>/^available[_ ]?sf$/i.test(x.key));
 if(e) availableField=e.path;
}
if(!availableField){
 finish("PASSED","M419D4AV1_UNIQUE_CURRENT_STATE_RECORD_BOUND_AVAILABLE_SF_FIELD_NOT_RECOVERED",{
  binding:{matchedRecordIndex:top.index,score:top.score,evidence:top.evidence},
  artifacts:{identityReconciliationAudit:auditPath},
  nextMilestone:"M4.19D4AV2_CURRENT_STATE_AVAILABLE_SF_FIELD_PATH_RECONCILIATION"
 });
}

const binding={
 contract:"SCIIP_EXPLORER_4_M4_19D4AV1_CURRENT_STATE_RECORD_BINDING_MANIFEST",
 version:VERSION,generatedAt:new Date().toISOString(),
 inventoryPath,inventorySha256Before:sha(invText),containerPath,
 matchedRecordIndex:top.index,
 bindingScore:top.score,
 bindingEvidence:top.evidence,
 certifiedObservationId:obs.observationId,
 canonicalPropertyId:obs.canonicalPropertyId,
 sourcePropertyId:obs.sourcePropertyId,
 address:obs.address,
 availableSfField:availableField,
 currentAvailableSf:record[availableField]??null,
 proposedAvailableSf:obs.value,
 executionAuthorized:false
};
write(bindingPath,binding);

finish("PASSED","M419D4AV1_UNIQUE_GOVERNED_BASE_INVENTORY_RECORD_IDENTITY_RECONCILED_AV_REPREAUTHORIZATION_READY",{
 reconciliation:{
  recordCount:records.length,
  matchedRecordIndex:top.index,
  bindingScore:top.score,
  bindingEvidence:top.evidence,
  availableSfField:availableField,
  currentAvailableSf:record[availableField]??null,
  proposedAvailableSf:obs.value
 },
 policy:{
  exactOrStrongIdentityEvidenceRequired:true,
  syntheticIdentityProhibited:true,
  currentStateMutationNotPerformed:true,
  downstreamPropagationNotAuthorized:true
 },
 artifacts:{
  identityReconciliationAudit:auditPath,
  currentStateRecordBindingManifest:bindingPath
 },
 nextMilestone:"M4.19D4AV2_CURRENT_STATE_PROMOTION_REPREAUTHORIZATION_USING_RECONCILED_INVENTORY_BINDING"
});
