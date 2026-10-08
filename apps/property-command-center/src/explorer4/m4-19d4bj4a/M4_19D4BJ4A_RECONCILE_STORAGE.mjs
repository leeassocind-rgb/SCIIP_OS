#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj4-controlled-five-property-canonical-identity-creation-execution-and-post-commit-certification.json");
const out=path.join(ev,"m4-19d4bj4a-production-storage-binding-reconciliation.json");

const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const shaFile=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const rel=p=>path.relative(app,p);

if(!fs.existsSync(prior)) throw new Error("BJ4 blocked-state evidence missing");
const P=readJson(prior);
if(P.state!=="M419D4BJ4_EXACT_PRODUCTION_CANONICAL_STORE_NOT_UNIQUELY_BOUND")
  throw new Error(`BJ4 state mismatch: ${P.state}`);
if(P.execution?.writesAttempted!==0 || P.execution?.creationsCommitted!==0)
  throw new Error("BJ4A requires zero prior production writes");

console.log("[BJ4A] BJ4 zero-write ambiguous-store state accepted");
console.log("[BJ4A] reconciling source-of-truth vs public/runtime materialization; writes remain OFF");

const srcCandidate=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const publicCandidate=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
for(const p of [srcCandidate,publicCandidate]){
  if(!fs.existsSync(p)) throw new Error("expected leading BJ4 candidate missing: "+p);
}

const srcSha=shaFile(srcCandidate);
const publicSha=shaFile(publicCandidate);
const byteIdentical=srcSha===publicSha;

function walk(dir,acc=[]){
  if(!fs.existsSync(dir)) return acc;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage","explorer4"].includes(ent.name)) continue;
      walk(p,acc);
    } else if(/\.(js|mjs|cjs|jsx|ts|tsx|json|md|command)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}
const sourceRoots=[
 path.join(app,"src"),
 path.join(app,"server"),
 path.join(app,"tools"),
 path.join(app,"scripts")
].filter(fs.existsSync);
const files=sourceRoots.flatMap(x=>walk(x));

const references=[];
for(const f of files){
  let text; try{text=fs.readFileSync(f,"utf8")}catch{continue}
  const hits=[];
  if(text.includes("src/production-validation/canonical-property-identity-data.json") ||
     text.includes("production-validation/canonical-property-identity-data.json"))
    hits.push("SRC_CANONICAL_PATH");
  if(text.includes("public/production-validation-data/canonical-property-identity-data.json") ||
     text.includes("/production-validation-data/canonical-property-identity-data.json"))
    hits.push("PUBLIC_CANONICAL_PATH");
  if(/canonical-property-identity-data\.json/.test(text)) hits.push("CANONICAL_BASENAME");
  if(hits.length){
    references.push({
      path:rel(f),
      hits:[...new Set(hits)],
      writes:/writeFile|writeFileSync|rename|atomicWrite|copyFile|copyFileSync|cpSync/.test(text),
      reads:/readFile|readFileSync|fetch\(|import\s/.test(text),
      publicProducer:/public\/production-validation-data/.test(text) && /writeFile|copyFile|cpSync|rename/.test(text),
      srcProducer:/src\/production-validation/.test(text) && /writeFile|copyFile|cpSync|rename/.test(text)
    });
  }
}

const srcWriteRefs=references.filter(x=>x.hits.includes("SRC_CANONICAL_PATH")&&x.writes);
const publicWriteRefs=references.filter(x=>x.hits.includes("PUBLIC_CANONICAL_PATH")&&x.writes);
const publicProducerRefs=references.filter(x=>x.publicProducer);
const runtimePublicReadRefs=references.filter(x=>x.hits.includes("PUBLIC_CANONICAL_PATH")&&x.reads&&!x.writes);
const runtimeSrcReadRefs=references.filter(x=>x.hits.includes("SRC_CANONICAL_PATH")&&x.reads&&!x.writes);

function jsonStats(p){
 const j=readJson(p);
 const text=fs.readFileSync(p,"utf8");
 return {
   topType:Array.isArray(j)?"ARRAY":"OBJECT",
   bytes:fs.statSync(p).size,
   canonicalPropertyIdCount:(text.match(/"canonicalPropertyId"\s*:/g)||[]).length,
   eventFieldCount:(text.match(/"(?:eventType|event|type)"\s*:/g)||[]).length,
   canonicalCanaryCommitCount:(text.match(/CANONICAL_CANARY_COMMIT/g)||[]).length,
   canonicalIdentityCreatedCount:(text.match(/CANONICAL_IDENTITY_CREATED/g)||[]).length
 };
}
const srcStats=jsonStats(srcCandidate);
const publicStats=jsonStats(publicCandidate);

// Search for event-store paths and original producer/consumer semantics.
const eventCandidates=[];
for(const f of files){
 let text; try{text=fs.readFileSync(f,"utf8")}catch{continue}
 const score=
   (/CANONICAL_IDENTITY_CREATED/.test(text)?4:0)+
   (/eventLog|eventStore|eventsPath|canonical.*event/i.test(text)?3:0)+
   (/writeFile|appendFile|atomicWrite|rename/.test(text)?2:0)+
   (/canonicalPropertyId/.test(text)?1:0);
 if(score>=5){
   const quoted=[...text.matchAll(/["'`]([^"'`]+?\.(?:json|jsonl))["'`]/g)].map(m=>m[1]);
   eventCandidates.push({
     path:rel(f),score,
     quotedDataPaths:[...new Set(quoted)].slice(0,30),
     writes:/writeFile|appendFile|atomicWrite|rename/.test(text),
     creationEvent:/CANONICAL_IDENTITY_CREATED/.test(text)
   });
 }
}
eventCandidates.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

// Adjudicate conservatively.
let canonicalClassification="UNRESOLVED";
let authoritativeCanonicalStore=null;
let runtimeMirror=null;

if(byteIdentical){
  if(publicProducerRefs.length>0 && srcWriteRefs.length>0 && publicWriteRefs.length===0){
    canonicalClassification="SRC_AUTHORITATIVE_PUBLIC_GENERATED_MIRROR";
    authoritativeCanonicalStore=srcCandidate;
    runtimeMirror=publicCandidate;
  } else if(publicProducerRefs.length>0 && srcWriteRefs.length===0){
    canonicalClassification="PUBLIC_GENERATED_FROM_SOURCE_BUT_SOURCE_WRITE_AUTHORITY_NOT_YET_PROVEN";
  } else if(runtimePublicReadRefs.length>0 && runtimeSrcReadRefs.length===0){
    canonicalClassification="PUBLIC_RUNTIME_COPY_SOURCE_AUTHORITY_NOT_YET_PROVEN";
  } else {
    canonicalClassification="BYTE_IDENTICAL_SOURCE_PUBLIC_PAIR_WRITE_DIRECTION_NOT_UNIQUELY_PROVEN";
  }
}

// If a unique explicit producer copies src -> public, that is strong evidence even when src writer isn't in same file.
const explicitSrcToPublic=references.filter(x=>
  x.writes &&
  x.hits.includes("SRC_CANONICAL_PATH") &&
  x.hits.includes("PUBLIC_CANONICAL_PATH")
);
if(byteIdentical && explicitSrcToPublic.length===1){
  canonicalClassification="SRC_AUTHORITATIVE_PUBLIC_GENERATED_MIRROR";
  authoritativeCanonicalStore=srcCandidate;
  runtimeMirror=publicCandidate;
}

const canonicalBindingProven=!!authoritativeCanonicalStore;

// Try to bind an actual event store path only from executable source references.
const resolvedEventPaths=[];
for(const c of eventCandidates){
 for(const q of c.quotedDataPaths){
   const candidates=[
     path.resolve(app,q),
     path.resolve(app,"src/runtime",q),
     path.resolve(repo,q)
   ];
   for(const abs of candidates){
     if(fs.existsSync(abs) && /\.(json|jsonl)$/.test(abs)){
       let text=""; try{text=fs.readFileSync(abs,"utf8")}catch{}
       const eventCount=(text.match(/"(?:eventType|event|type)"\s*:/g)||[]).length;
       const cpropCount=(text.match(/"canonicalPropertyId"\s*:/g)||[]).length;
       resolvedEventPaths.push({
         path:abs,
         producer:c.path,
         score:c.score+(eventCount>0?2:0)+(cpropCount>0?1:0),
         eventCount,cpropCount,
         sha256:shaFile(abs)
       });
     }
   }
 }
}
const dedupEvent=[...new Map(resolvedEventPaths.map(x=>[x.path,x])).values()]
 .sort((a,b)=>b.score-a.score||b.eventCount-a.eventCount);

let authoritativeEventStore=null;
if(dedupEvent.length===1) authoritativeEventStore=dedupEvent[0].path;
else if(dedupEvent.length>1 && dedupEvent[0].score>dedupEvent[1].score) authoritativeEventStore=dedupEvent[0].path;

const eventBindingProven=!!authoritativeEventStore;

let state,next;
if(canonicalBindingProven && eventBindingProven){
 state="M419D4BJ4A_PRODUCTION_CANONICAL_AND_EVENT_STORAGE_BINDINGS_RECONCILED_BJ4_REEXECUTION_PREAUTHORIZATION_READY";
 next="M4.19D4BJ4B_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_PREAUTHORIZATION";
}else if(canonicalBindingProven){
 state="M419D4BJ4A_CANONICAL_STORE_AUTHORITY_RECONCILED_EVENT_STORE_BINDING_REMAINS_UNRESOLVED_TARGETED_EVENT_LINEAGE_REQUIRED";
 next="M4.19D4BJ4A1_CANONICAL_CREATION_EVENT_STORE_LINEAGE_RECONCILIATION";
}else{
 state="M419D4BJ4A_CANONICAL_STORE_WRITE_AUTHORITY_REMAINS_UNRESOLVED_TARGETED_SOURCE_MATERIALIZATION_LINEAGE_REQUIRED";
 next="M4.19D4BJ4A1_CANONICAL_SOURCE_TO_PUBLIC_MATERIALIZATION_LINEAGE_RECONCILIATION";
}

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ4A_PRODUCTION_STORAGE_BINDING_RECONCILIATION",
 version:"4.0-m4.19d4bj4a",
 status:"PASSED",
 state,
 certifiedAt:new Date().toISOString(),
 priorExecution:{writesAttempted:0,creationsCommitted:0,productionMutationPerformed:false},
 canonicalStoreReconciliation:{
   srcCandidate,publicCandidate,
   srcSha256:srcSha,publicSha256:publicSha,byteIdentical,
   srcStats,publicStats,
   classification:canonicalClassification,
   authoritativeCanonicalStore,
   runtimeMirror,
   bindingProven:canonicalBindingProven,
   references,
   explicitSrcToPublic,
   srcWriteRefCount:srcWriteRefs.length,
   publicWriteRefCount:publicWriteRefs.length,
   publicProducerRefCount:publicProducerRefs.length,
   runtimePublicReadRefCount:runtimePublicReadRefs.length,
   runtimeSrcReadRefCount:runtimeSrcReadRefs.length
 },
 eventStoreReconciliation:{
   executableCandidates:eventCandidates.slice(0,30),
   resolvedDataCandidates:dedupEvent.slice(0,20),
   authoritativeEventStore,
   bindingProven:eventBindingProven
 },
 policy:{
   noInferenceFromIdenticalCountsAlone:true,
   byteIdentityIsSupportingNotSoleAuthorityEvidence:true,
   explicitProducerConsumerDirectionPreferred:true,
   noProductionWriteInThisMilestone:true,
   noBJ4AutomaticRetry:true,
   priorBJ4AuthorizationNotConsumedByBlockedZeroWriteAttempt:true,
   explicitReexecutionPreauthorizationStillRequired:true
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
