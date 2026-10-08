#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj4a1-canonical-source-public-materialization-lineage-reconciliation.json");
const out=path.join(ev,"m4-19d4bj4a2-canonical-creation-event-store-lineage-reconciliation.json");
const adapter=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");

const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const rel=p=>path.relative(app,p);
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

if(!fs.existsSync(prior)) throw new Error("BJ4A1 evidence missing");
const P=readJson(prior);
if(P.state!=="M419D4BJ4A1_CANONICAL_WRITE_AUTHORITY_AND_PUBLIC_MIRROR_LINEAGE_CERTIFIED_A2_EVENT_STORE_RECONCILIATION_READY"){
 console.log(JSON.stringify({
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4A2_CANONICAL_CREATION_EVENT_STORE_LINEAGE_RECONCILIATION",
  version:"4.0-m4.19d4bj4a2",status:"SKIPPED",
  state:"M419D4BJ4A2_SKIPPED_CANONICAL_WRITE_AUTHORITY_NOT_YET_CERTIFIED",
  observedA1State:P.state
 },null,2));
 process.exit(0);
}
if(!fs.existsSync(adapter)) throw new Error("first-insert production adapter missing");

console.log("[BJ4A2] A1 canonical authority certification accepted");
console.log("[BJ4A2] tracing canonical creation-event persistence path; writes remain OFF");

function walk(dir,acc=[]){
 if(!fs.existsSync(dir)) return acc;
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory()){
   if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name)) continue;
   walk(p,acc);
  }else if(/\.(js|mjs|cjs|jsx|ts|tsx|py|json|jsonl|md)$/.test(e.name)) acc.push(p);
 }
 return acc;
}
const roots=[path.join(app,"src/runtime"),path.join(app,"src/production-validation"),path.join(app,"tools"),path.join(app,"server"),ev].filter(fs.existsSync);
const all=[...new Set(roots.flatMap(r=>walk(r)))];

const adapterText=fs.readFileSync(adapter,"utf8");
const adapterLines=adapterText.split(/\r?\n/);
const adapterEvidence=[];
for(let i=0;i<adapterLines.length;i++){
 const s=adapterLines[i];
 if(/eventLogPath|eventsPath|CANONICAL_IDENTITY_CREATED|atomicInsert|readAfterWrite|writeFile|rename/i.test(s))
   adapterEvidence.push({line:i+1,text:s.trim()});
}

// Inspect evidence for previously certified real canonical event stores / paths.
const pathMentions=[];
for(const f of all){
 let t=""; try{t=fs.readFileSync(f,"utf8")}catch{continue}
 if(!/canonical|event/i.test(t)) continue;
 const quoted=[...t.matchAll(/["'`]([^"'`]+?\.(?:json|jsonl))["'`]/g)].map(m=>m[1]);
 const hasCreated=/CANONICAL_IDENTITY_CREATED/.test(t);
 const hasEventStore=/eventLogPath|eventStore|eventsPath|canonical.*event/i.test(t);
 const writes=/writeFile|appendFile|atomicWrite|rename/.test(t);
 for(const q of quoted){
   if(!/event|canonical|identity/i.test(q)) continue;
   pathMentions.push({source:rel(f),quoted:q,hasCreated,hasEventStore,writes});
 }
}

// Resolve real existing candidate files and inspect semantics.
const resolved=[];
for(const m of pathMentions){
 const cands=[
  path.resolve(app,m.quoted),
  path.resolve(path.dirname(path.join(app,m.source)),m.quoted),
  path.resolve(repo,m.quoted)
 ];
 for(const p of cands){
  if(!fs.existsSync(p)||!/\.(json|jsonl)$/.test(p)) continue;
  let t=""; try{t=fs.readFileSync(p,"utf8")}catch{continue}
  const eventTypeCount=(t.match(/"(?:eventType|event|type)"\s*:/g)||[]).length;
  const canonicalCount=(t.match(/"canonicalPropertyId"\s*:/g)||[]).length;
  const creationCount=(t.match(/CANONICAL_IDENTITY_CREATED/g)||[]).length;
  resolved.push({
    path:p,source:m.source,hasCreated:m.hasCreated,hasEventStore:m.hasEventStore,writes:m.writes,
    eventTypeCount,canonicalCount,creationCount,sha256:sha(p)
  });
 }
}
const dedup=[...new Map(resolved.map(x=>[x.path,x])).values()];
for(const x of dedup){
 x.score=(x.creationCount>0?20:0)+(x.eventTypeCount>0?5:0)+(x.canonicalCount>0?3:0)+(x.hasEventStore?4:0)+(x.writes?3:0)+(x.hasCreated?2:0);
}
dedup.sort((a,b)=>b.score-a.score||b.eventTypeCount-a.eventTypeCount||a.path.localeCompare(b.path));

let authoritativeEventStore=null;
let confidence="LOW";
if(dedup.length===1 && dedup[0].score>=10){
 authoritativeEventStore=dedup[0].path; confidence="HIGH";
}else if(dedup.length>1 && dedup[0].score>=10 && dedup[0].score>dedup[1].score+2){
 authoritativeEventStore=dedup[0].path; confidence="HIGH";
}

// If no prior standalone event file exists, determine whether the certified adapter contract itself
// intentionally requires a distinct eventLogPath supplied at construction time.
const adapterRequiresInjectedEventPath=/eventLogPath/.test(adapterText) &&
  /canonicalStorePath/.test(adapterText) &&
  /buildGovernedCanonicalFirstInsertProductionStoreAdapter/.test(adapterText);
const distinctEventStoreRequired=adapterRequiresInjectedEventPath;

let classification, state, next;
if(authoritativeEventStore){
 classification="EXISTING_CANONICAL_CREATION_EVENT_STORE_UNIQUELY_BOUND";
 state="M419D4BJ4A2_CANONICAL_CREATION_EVENT_STORE_UNIQUELY_BOUND_BJ4B_REEXECUTION_PREAUTHORIZATION_READY";
 next="M4.19D4BJ4B_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_PREAUTHORIZATION";
}else if(distinctEventStoreRequired){
 classification="ADAPTER_REQUIRES_INJECTED_DISTINCT_EVENT_STORE_BUT_NO_EXISTING_PRODUCTION_EVENT_STORE_PATH_PROVEN";
 state="M419D4BJ4A2_EVENT_STORE_CAPABILITY_PATH_GAP_CERTIFIED_CONTROLLED_PRODUCTION_EVENT_STORE_BINDING_DESIGN_REQUIRED";
 next="M4.19D4BJ4A3_PRODUCTION_CANONICAL_CREATION_EVENT_STORE_BINDING_DESIGN_AND_PREAUTHORIZATION";
}else{
 classification="EVENT_STORE_LINEAGE_UNRESOLVED";
 state="M419D4BJ4A2_CANONICAL_CREATION_EVENT_STORE_NOT_UNIQUELY_BOUND_FURTHER_LINEAGE_REQUIRED";
 next="M4.19D4BJ4A2R1_TARGETED_EVENT_STORE_RUNTIME_PATH_PROBE";
}

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ4A2_CANONICAL_CREATION_EVENT_STORE_LINEAGE_RECONCILIATION",
 version:"4.0-m4.19d4bj4a2",
 status:"PASSED",
 state,
 certifiedAt:new Date().toISOString(),
 reconciliation:{
   classification,
   confidence,
   authoritativeEventStore,
   bindingProven:!!authoritativeEventStore,
   adapterRequiresInjectedEventPath,
   distinctEventStoreRequired,
   resolvedCandidates:dedup.slice(0,30),
   pathMentions:pathMentions.slice(0,80),
   adapterEvidence:adapterEvidence.slice(0,120)
 },
 canonicalBindingFromA1:{
   authoritativeCanonicalStore:P.reconciliation?.authoritativeCanonicalStore||null,
   runtimeMirror:P.reconciliation?.runtimeMirror||null,
   confidence:P.reconciliation?.confidence||null
 },
 policy:{
   noInventedEventStorePath:true,
   existingProductionPathRequiredOrGapMustBeAdjudicated:true,
   noProductionWrite:true,
   noBJ4Retry:true
 },
 nextMilestone:next,
 authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
   productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
   governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,automaticRetry:false
 }
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
