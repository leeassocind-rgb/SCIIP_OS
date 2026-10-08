#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const evidence=path.join(app,"evidence");
const prior=path.join(evidence,"m4-19d4bj3a10-governed-canonical-identity-first-insert-primitive-certification.json");
const out=path.join(evidence,"m4-19d4bj3a11-production-canonical-id-authority-and-first-insert-storage-binding-forensics.json");

const read=p=>fs.readFileSync(p,"utf8");
const sha=s=>crypto.createHash("sha256").update(s).digest("hex");

if(!fs.existsSync(prior)) throw new Error("BJ3A10 evidence missing");
const p=JSON.parse(read(prior));
const required="M419D4BJ3A10_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT_PRIMITIVE_IMPLEMENTED_ISOLATED_CERTIFICATION_PASSED_PRODUCTION_BINDING_NOT_AUTHORIZED";
if(p.state!==required) throw new Error(`BJ3A10 state mismatch: ${p.state}`);

console.log("[BJ3A11] BJ3A10 primitive certification accepted");
console.log("[BJ3A11] bounded production authority/storage forensics starting; writes remain OFF");

const roots=[
 "src/runtime",
 "src/broker-product/property-explorer/intelligence",
 "server",
 "tools"
].map(x=>path.join(app,x)).filter(fs.existsSync);

function walk(dir, acc=[]){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
   const q=path.join(dir,ent.name);
   if(ent.isDirectory()){
     if(["node_modules","dist","build",".git","coverage","explorer4"].includes(ent.name)) continue;
     walk(q,acc);
   } else if(/\.(js|mjs|cjs|jsx|ts|tsx)$/.test(ent.name)) acc.push(q);
 }
 return acc;
}
const files=roots.flatMap(r=>walk(r));
const rel=q=>path.relative(app,q);

const authoritySignals=[
 /canonicalPropertyId/ig,/sourcePropertyId/ig,/deterministic/ig,/identity/ig,
 /resolveCanonical/ig,/canonical.*id/ig,/hash/ig,/uuid/ig,/authority/ig
];
const storageSignals=[
 /atomicInsert/ig,/writeAtomic/ig,/atomicWriteJson/ig,/createCertifiedCanonicalPropertyStoreAdapter/ig,
 /canonical.*store/ig,/persist/ig,/append/ig,/readAfterWrite/ig
];

function score(text, regs){
 let s=0;
 for(const re0 of regs){
   const re=new RegExp(re0.source,re0.flags);
   if(re.test(text)) s++;
 }
 return s;
}
function functions(text){
 const found=new Set();
 for(const re of [
   /export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g,
   /function\s+([A-Za-z0-9_$]+)\s*\(/g,
   /export\s+const\s+([A-Za-z0-9_$]+)\s*=/g,
   /const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(/g
 ]){
   let m; while((m=re.exec(text))) found.add(m[1]);
 }
 return [...found].slice(0,30);
}

const authority=[];
const storage=[];
let analyzed=0;
for(const f of files){
 let text;
 try{text=read(f)}catch{continue}
 analyzed++;
 if(analyzed%50===0) console.log(`[BJ3A11] analyzed ${analyzed}/${files.length}`);
 const a=score(text,authoritySignals);
 const s=score(text,storageSignals);
 if(a>=4) authority.push({path:rel(f),score:a,functions:functions(text),sha256:sha(text)});
 if(s>=3) storage.push({path:rel(f),score:s,functions:functions(text),sha256:sha(text)});
}
authority.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
storage.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

const primitivePath=path.join(app,"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js");
const primitivePresent=fs.existsSync(primitivePath);

const knownAdapter="src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js";
const knownAdapterCandidate=storage.find(x=>x.path===knownAdapter)||null;

// This milestone intentionally does not guess that a high-scoring source is executable authority.
// A production binding is certified only when the source exposes sufficiently explicit callable semantics.
function explicitAuthorityCandidate(c){
 const names=(c.functions||[]).join(" ");
 return /resolve.*canonical.*property.*id|derive.*canonical.*property.*id|create.*canonical.*identity/i.test(names);
}
function explicitFirstInsertStorage(c){
 const names=(c.functions||[]).join(" ");
 return /atomicInsert|firstInsert|insertCanonical|create.*canonical/i.test(names);
}
const explicitAuthorities=authority.filter(explicitAuthorityCandidate);
const explicitStores=storage.filter(explicitFirstInsertStorage);

let state;
let next;
if(explicitAuthorities.length===1 && explicitStores.length===1){
 state="M419D4BJ3A11_UNIQUE_PRODUCTION_CANONICAL_ID_AUTHORITY_AND_FIRST_INSERT_STORAGE_BINDINGS_RECOVERED_BINDING_CERTIFICATION_READY";
 next="M4.19D4BJ3A12_PRODUCTION_FIRST_INSERT_BINDING_ADAPTER_IMPLEMENTATION_AND_READ_ONLY_CERTIFICATION";
}else{
 state="M419D4BJ3A11_PRODUCTION_FIRST_INSERT_BINDING_NOT_UNIQUELY_PROVEN_TARGETED_BINDING_RECONCILIATION_REQUIRED";
 next="M4.19D4BJ3A11R1_TARGETED_PRODUCTION_CANONICAL_ID_AUTHORITY_AND_FIRST_INSERT_STORAGE_RECONCILIATION";
}

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A11_PRODUCTION_CANONICAL_ID_AUTHORITY_AND_FIRST_INSERT_STORAGE_BINDING_FORENSICS",
 version:"4.0-m4.19d4bj3a11",
 status:"PASSED",
 state,
 certifiedAt:new Date().toISOString(),
 forensics:{
   rootsScanned:roots.map(rel),
   candidateFilesCollected:files.length,
   filesAnalyzed:analyzed,
   primitivePresent,
   authorityCandidateCount:authority.length,
   storageCandidateCount:storage.length,
   explicitAuthorityCandidateCount:explicitAuthorities.length,
   explicitFirstInsertStorageCandidateCount:explicitStores.length,
   authorityCandidates:authority.slice(0,20),
   storageCandidates:storage.slice(0,20),
   explicitAuthorityCandidates:explicitAuthorities,
   explicitFirstInsertStorageCandidates:explicitStores,
   previouslyKnownUpdateAdapterCandidate:knownAdapterCandidate
 },
 adjudication:{
   productionCanonicalIdAuthorityUniquelyProven:explicitAuthorities.length===1,
   productionFirstInsertStorageUniquelyProven:explicitStores.length===1,
   productionBindingCertified:explicitAuthorities.length===1 && explicitStores.length===1,
   highScoreAloneCannotConferWriteAuthority:true,
   updateOrCanaryCommitSemanticsCannotBeRepurposedAsFirstInsertWithoutProof:true
 },
 policy:{
   evidenceFilesExcludedFromExecutionAuthority:true,
   generatedExplorer4SourcesExcludedFromProductionAuthority:true,
   noProductionWriteInThisMilestone:true,
   noNetworkRequestInThisMilestone:true,
   noSyntheticCanonicalIdentity:true,
   BJ4ExecutionStillProhibited:true,
   explicitCallableProductionBindingRequired:true
 },
 nextMilestone:next,
 authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,
   canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,
   identityCreationExecuted:false,automaticRetry:false
 }
};
fs.mkdirSync(evidence,{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
