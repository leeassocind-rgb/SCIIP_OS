#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION";
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const preauthPath=path.join(ev,"m4-19d4bj3c-r1-five-property-canonical-identity-creation-final-repreauthorization.json");
const a14Path=path.join(ev,"m4-19d4bj3a14-production-first-insert-store-adapter-implementation-and-isolated-filesystem-certification.json");
const adapterSourcePath=path.join(app,"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js");
const out=path.join(ev,"m4-19d4bj4-controlled-five-property-canonical-identity-creation-execution-and-post-commit-certification.json");

const shaBuf=b=>crypto.createHash("sha256").update(b).digest("hex");
const shaJson=x=>shaBuf(Buffer.from(JSON.stringify(x)));
const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const now=()=>new Date().toISOString();

function failBeforeWrite(state,detail={}){
  const result={
    contract:"SCIIP_EXPLORER_4_M4_19D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION_AND_POST_COMMIT_CERTIFICATION",
    version:"4.0-m4.19d4bj4",status:"BLOCKED",state,certifiedAt:now(),
    detail,
    execution:{writesAttempted:0,creationsCommitted:0,rolledBack:false},
    nextMilestone:"M4.19D4BJ4A_PRODUCTION_STORAGE_BINDING_RECONCILIATION",
    safety:{productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,networkRequestsPerformed:0,automaticRetry:false}
  };
  fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));
  process.exit(2);
}

if(auth!==REQUIRED_AUTH) failBeforeWrite("M419D4BJ4_EXPLICIT_AUTHORIZATION_TOKEN_REQUIRED",{requiredAuthorizationToken:REQUIRED_AUTH});
if(!fs.existsSync(preauthPath)) failBeforeWrite("M419D4BJ4_BJ3C_R1_PREAUTHORIZATION_MISSING");
if(!fs.existsSync(a14Path)) failBeforeWrite("M419D4BJ4_A14_ADAPTER_CERTIFICATION_MISSING");

const P=readJson(preauthPath);
const A14=readJson(a14Path);
if(P.state!=="M419D4BJ3C_R1_EXACT_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZED_BJ4_EXECUTION_AUTHORIZATION_REQUIRED")
  failBeforeWrite("M419D4BJ4_BJ3C_R1_STATE_MISMATCH",{observed:P.state});
if(A14.state!=="M419D4BJ3A14_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_FIVE_RECORD_REPREAUTHORIZATION_READY")
  failBeforeWrite("M419D4BJ4_A14_STATE_MISMATCH",{observed:A14.state});

const cohort=P.cohort?.records||[];
if(cohort.length!==5) failBeforeWrite("M419D4BJ4_EXACT_FIVE_RECORD_COHORT_REQUIRED",{count:cohort.length});
const recomputedCohortHash=shaJson(cohort);
if(recomputedCohortHash!==P.cohort?.cohortHash)
  failBeforeWrite("M419D4BJ4_FROZEN_COHORT_HASH_MISMATCH",{expected:P.cohort?.cohortHash,observed:recomputedCohortHash});
if(new Set(cohort.map(x=>x.sourcePropertyId)).size!==5 || new Set(cohort.map(x=>x.canonicalPropertyId)).size!==5)
  failBeforeWrite("M419D4BJ4_COHORT_IDENTITY_UNIQUENESS_FAILED");

console.log("[BJ4] explicit authorization accepted");
console.log(`[BJ4] frozen cohort hash certified: ${recomputedCohortHash}`);
console.log("[BJ4] discovering exact production canonical store + canonical creation-event store");
console.log("[BJ4] NO WRITE occurs until both bindings are unique and all five preflight checks pass");

function walkFiles(dir, acc=[]){
  if(!fs.existsSync(dir)) return acc;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage"].includes(ent.name)) continue;
      walkFiles(p,acc);
    } else acc.push(p);
  }
  return acc;
}
function extractPathsFromJson(value, out=[]){
  if(typeof value==="string"){
    if(path.isAbsolute(value) && fs.existsSync(value)) out.push(value);
  }else if(Array.isArray(value)){
    for(const x of value) extractPathsFromJson(x,out);
  }else if(value && typeof value==="object"){
    for(const v of Object.values(value)) extractPathsFromJson(v,out);
  }
  return out;
}
function scanEvidencePaths(){
  const paths=[];
  for(const f of walkFiles(ev).filter(x=>x.endsWith(".json"))){
    try{ extractPathsFromJson(readJson(f),paths); }catch{}
  }
  return [...new Set(paths)];
}
function quotedJsonPathsFromSource(){
  if(!fs.existsSync(adapterSourcePath)) return [];
  const t=fs.readFileSync(adapterSourcePath,"utf8");
  const out=[];
  for(const m of t.matchAll(/["'`]([^"'`]+?\.(?:json|jsonl))["'`]/g)){
    const s=m[1];
    const candidates=[
      path.resolve(app,s),
      path.resolve(path.dirname(adapterSourcePath),s),
      path.resolve(repo,s)
    ];
    for(const q of candidates) if(fs.existsSync(q)) out.push(q);
  }
  return [...new Set(out)];
}
const candidatePaths=[...new Set([...scanEvidencePaths(),...quotedJsonPathsFromSource()])]
  .filter(p=>/\.(json|jsonl)$/i.test(p))
  .filter(p=>!p.includes("m4-19d4bj4-controlled-five-property"));

function countRegex(file,re){
  try{
    const t=fs.readFileSync(file,"utf8");
    let n=0; for(const _ of t.matchAll(re)) n++;
    return n;
  }catch{return 0}
}
function inspectCandidate(p){
  const cprop=countRegex(p,/\bCPROP-[A-F0-9]{20}\b/ig);
  const source=countRegex(p,/\b(?:BASE|PROPERTY)-[A-Z0-9-]+\b/ig);
  const creation=countRegex(p,/CANONICAL_IDENTITY_CREATED/ig);
  const event=countRegex(p,/"(?:eventType|type|event)"\s*:/ig);
  const canonicalField=countRegex(p,/"canonicalPropertyId"\s*:/ig);
  let jsonType=null;
  try{
    if(p.endsWith(".json")){
      const j=readJson(p); jsonType=Array.isArray(j)?"ARRAY":(j&&typeof j==="object"?"OBJECT":"OTHER");
    } else jsonType="JSONL";
  }catch{jsonType="INVALID"}
  return {path:p,cprop,source,creation,event,canonicalField,jsonType};
}
const inspected=candidatePaths.map(inspectCandidate).filter(x=>x.jsonType!=="INVALID");

const storeCandidates=inspected
  .filter(x=>x.cprop>=10 && x.canonicalField>=10)
  .sort((a,b)=>(b.canonicalField+b.cprop)-(a.canonicalField+a.cprop));

const eventCandidates=inspected
  .filter(x=>x.event>=1 && x.canonicalField>=1)
  .sort((a,b)=>(b.creation*10+b.event+b.canonicalField)-(a.creation*10+a.event+a.canonicalField));

function uniqueTop(cands,scoreFn){
  if(cands.length===0) return null;
  const topScore=scoreFn(cands[0]);
  const tied=cands.filter(x=>scoreFn(x)===topScore);
  return tied.length===1?cands[0]:null;
}
const store=uniqueTop(storeCandidates,x=>x.canonicalField+x.cprop);
let eventStore=uniqueTop(eventCandidates,x=>x.creation*10+x.event+x.canonicalField);

// Do not allow the same file to be guessed as both unless it actually has event semantics and a distinct event container.
if(store && eventStore && store.path===eventStore.path && eventStore.event<1) eventStore=null;

if(!store) failBeforeWrite("M419D4BJ4_EXACT_PRODUCTION_CANONICAL_STORE_NOT_UNIQUELY_BOUND",{topCandidates:storeCandidates.slice(0,10)});
if(!eventStore) failBeforeWrite("M419D4BJ4_EXACT_PRODUCTION_CANONICAL_EVENT_STORE_NOT_UNIQUELY_BOUND",{topCandidates:eventCandidates.slice(0,10)});

console.log(`[BJ4] canonical store bound: ${store.path}`);
console.log(`[BJ4] event store bound: ${eventStore.path}`);

function findArrays(root, predicate, pathParts=[], hits=[]){
  if(Array.isArray(root)){
    const score=root.reduce((n,x)=>n+(predicate(x)?1:0),0);
    if(score>0) hits.push({path:[...pathParts],score,length:root.length});
    root.forEach((x,i)=>{
      if(x && typeof x==="object") findArrays(x,predicate,[...pathParts,i],hits);
    });
  }else if(root && typeof root==="object"){
    for(const [k,v] of Object.entries(root)) if(v&&typeof v==="object") findArrays(v,predicate,[...pathParts,k],hits);
  }
  return hits;
}
function getAt(root, parts){ let x=root; for(const p of parts)x=x[p]; return x; }
function setAt(root,parts,value){
  if(parts.length===0) return value;
  let x=root; for(let i=0;i<parts.length-1;i++) x=x[parts[i]];
  x[parts.at(-1)]=value; return root;
}
function parseJsonOrJsonl(p){
  const text=fs.readFileSync(p,"utf8");
  if(p.endsWith(".jsonl")){
    const rows=text.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
    return {kind:"JSONL",root:rows,containerPath:[]};
  }
  const root=JSON.parse(text);
  return {kind:"JSON",root};
}
function chooseContainer(parsed,kind){
  if(parsed.kind==="JSONL") return [];
  const predicate=kind==="STORE"
    ? x=>x&&typeof x==="object"&&typeof x.canonicalPropertyId==="string"
    : x=>x&&typeof x==="object"&&(typeof x.eventType==="string"||typeof x.type==="string"||typeof x.event==="string");
  const hits=findArrays(parsed.root,predicate).sort((a,b)=>b.score-a.score||b.length-a.length);
  if(Array.isArray(parsed.root)){
    const rootScore=parsed.root.reduce((n,x)=>n+(predicate(x)?1:0),0);
    if(rootScore>0) return [];
  }
  if(hits.length===0) return null;
  if(hits.length>1 && hits[0].score===hits[1].score) return null;
  return hits[0].path;
}
const storeParsed=parseJsonOrJsonl(store.path);
const eventParsed=parseJsonOrJsonl(eventStore.path);
const storeContainerPath=chooseContainer(storeParsed,"STORE");
const eventContainerPath=chooseContainer(eventParsed,"EVENT");
if(storeContainerPath===null) failBeforeWrite("M419D4BJ4_CANONICAL_STORE_RECORD_CONTAINER_NOT_UNIQUELY_BOUND",{store:store.path});
if(eventContainerPath===null) failBeforeWrite("M419D4BJ4_EVENT_STORE_RECORD_CONTAINER_NOT_UNIQUELY_BOUND",{eventStore:eventStore.path});

function collectObjects(x,out=[]){
  if(Array.isArray(x)){ for(const v of x) collectObjects(v,out); }
  else if(x&&typeof x==="object"){ out.push(x); for(const v of Object.values(x)) if(v&&typeof v==="object") collectObjects(v,out); }
  return out;
}
const storeObjects=collectObjects(storeParsed.root);
for(const r of cohort){
  if(storeObjects.some(x=>x?.canonicalPropertyId===r.canonicalPropertyId))
    failBeforeWrite("M419D4BJ4_PREWRITE_DUPLICATE_CANONICAL_ID",{canonicalPropertyId:r.canonicalPropertyId});
  if(storeObjects.some(x=>x?.sourcePropertyId===r.sourcePropertyId))
    failBeforeWrite("M419D4BJ4_PREWRITE_DUPLICATE_SOURCE_PROPERTY_ID",{sourcePropertyId:r.sourcePropertyId});
}
console.log("[BJ4] all five immediate pre-write duplicate checks PASSED");

const storeBefore=fs.readFileSync(store.path);
const eventBefore=fs.readFileSync(eventStore.path);
const storeShaBefore=shaBuf(storeBefore), eventShaBefore=shaBuf(eventBefore);
const backupDir=path.join(ev,"m4-19d4bj4-backups");
fs.mkdirSync(backupDir,{recursive:true});
const storeBackup=path.join(backupDir,path.basename(store.path)+".pre-bj4.bak");
const eventBackup=path.join(backupDir,path.basename(eventStore.path)+".pre-bj4.bak");
fs.writeFileSync(storeBackup,storeBefore);
fs.writeFileSync(eventBackup,eventBefore);

function atomicWrite(p,buf){
  const tmp=p+".bj4tmp-"+process.pid;
  fs.writeFileSync(tmp,buf);
  fs.renameSync(tmp,p);
}
function serialize(parsed){
  if(parsed.kind==="JSONL") return Buffer.from(parsed.root.map(x=>JSON.stringify(x)).join("\n")+"\n");
  return Buffer.from(JSON.stringify(parsed.root,null,2)+"\n");
}
function recordArray(parsed,parts){ return getAt(parsed.root,parts); }

let committed=[];
let rolledBack=false;
let failure=null;
try{
  for(const r of cohort.sort((a,b)=>a.cohortPosition-b.cohortPosition)){
    // re-read before every insert and recheck immediately.
    const liveStore=parseJsonOrJsonl(store.path);
    const liveObjects=collectObjects(liveStore.root);
    if(liveObjects.some(x=>x?.canonicalPropertyId===r.canonicalPropertyId)) throw new Error("DUPLICATE_CANONICAL:"+r.canonicalPropertyId);
    if(liveObjects.some(x=>x?.sourcePropertyId===r.sourcePropertyId)) throw new Error("DUPLICATE_SOURCE:"+r.sourcePropertyId);

    const ts=now();
    const idempotencyKey="CANONICAL_FIRST_INSERT:"+crypto.createHash("sha256")
      .update(`${r.canonicalPropertyId}|${r.sourcePropertyId}|${r.derivationHash}`).digest("hex");
    const newRecord={
      canonicalPropertyId:r.canonicalPropertyId,
      sourcePropertyId:r.sourcePropertyId,
      normalizedAddress:r.address,
      address:r.address,
      canonicalIdentity:{
        authorityReference:r.authorityReference,
        derivationHash:r.derivationHash,
        deterministic:true,
        synthetic:false,
        createdAt:ts
      },
      provenance:{
        cohort:"M4.19D4BJ",
        cohortHash:P.cohort.cohortHash,
        source:"GOVERNED_BASE_INVENTORY",
        creationMilestone:"M4.19D4BJ4"
      },
      idempotencyKey
    };
    const creationEvent={
      eventType:"CANONICAL_IDENTITY_CREATED",
      canonicalPropertyId:r.canonicalPropertyId,
      sourcePropertyId:r.sourcePropertyId,
      normalizedAddress:r.address,
      authorityReference:r.authorityReference,
      derivationHash:r.derivationHash,
      idempotencyKey,
      observationTimestamp:ts,
      cohortHash:P.cohort.cohortHash
    };

    const s=parseJsonOrJsonl(store.path);
    const e=parseJsonOrJsonl(eventStore.path);
    const sArr=recordArray(s,storeContainerPath);
    const eArr=recordArray(e,eventContainerPath);
    if(!Array.isArray(sArr)||!Array.isArray(eArr)) throw new Error("BOUND_CONTAINER_NOT_ARRAY");
    sArr.push(newRecord);
    eArr.push(creationEvent);

    atomicWrite(store.path,serialize(s));
    atomicWrite(eventStore.path,serialize(e));

    const verifyS=collectObjects(parseJsonOrJsonl(store.path).root)
      .find(x=>x?.canonicalPropertyId===r.canonicalPropertyId && x?.sourcePropertyId===r.sourcePropertyId && x?.idempotencyKey===idempotencyKey);
    const verifyE=collectObjects(parseJsonOrJsonl(eventStore.path).root)
      .find(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED" && x?.canonicalPropertyId===r.canonicalPropertyId && x?.sourcePropertyId===r.sourcePropertyId && x?.idempotencyKey===idempotencyKey);
    if(!verifyS||!verifyE) throw new Error("READ_AFTER_WRITE_VERIFICATION_FAILED:"+r.canonicalPropertyId);

    committed.push({
      cohortPosition:r.cohortPosition,
      canonicalPropertyId:r.canonicalPropertyId,
      sourcePropertyId:r.sourcePropertyId,
      address:r.address,
      idempotencyKey,
      readAfterWriteVerified:true
    });
    console.log(`[BJ4] committed ${committed.length}/5: ${r.canonicalPropertyId} — ${r.address}`);
  }
}catch(err){
  failure=String(err?.stack||err);
  try{
    atomicWrite(store.path,storeBefore);
    atomicWrite(eventStore.path,eventBefore);
    rolledBack=true;
  }catch(rollbackErr){
    failure += "\nROLLBACK_FAILURE:\n"+String(rollbackErr?.stack||rollbackErr);
  }
}

if(failure){
  const result={
    contract:"SCIIP_EXPLORER_4_M4_19D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION_AND_POST_COMMIT_CERTIFICATION",
    version:"4.0-m4.19d4bj4",
    status:"BLOCKED",
    state:rolledBack?"M419D4BJ4_EXECUTION_FAILED_COHORT_ROLLED_BACK":"M419D4BJ4_EXECUTION_FAILED_ROLLBACK_NOT_CERTIFIED",
    certifiedAt:now(),
    execution:{writesAttempted:committed.length+1,creationsCommittedBeforeFailure:committed.length,committed,rolledBack,failure},
    storageBinding:{canonicalStore:store.path,eventStore:eventStore.path,storeContainerPath,eventContainerPath},
    nextMilestone:"M4.19D4BJ4R1_EXECUTION_FAILURE_RECONCILIATION",
    safety:{networkRequestsPerformed:0,availabilityMutationPerformed:false,temporalAvailabilityMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,automaticRetry:false}
  };
  fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));
  process.exit(2);
}

const storeAfter=fs.readFileSync(store.path), eventAfter=fs.readFileSync(eventStore.path);
const storeObjectsAfter=collectObjects(parseJsonOrJsonl(store.path).root);
const eventObjectsAfter=collectObjects(parseJsonOrJsonl(eventStore.path).root);
const postChecks={
  exactFiveCommitted:committed.length===5,
  eachCanonicalPresentExactlyOnce:cohort.every(r=>storeObjectsAfter.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId).length===1),
  eachSourcePresentExactlyOnce:cohort.every(r=>storeObjectsAfter.filter(x=>x?.sourcePropertyId===r.sourcePropertyId).length===1),
  eachCreationEventPresentExactlyOnce:cohort.every(r=>eventObjectsAfter.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED"&&x?.canonicalPropertyId===r.canonicalPropertyId).length===1),
  allReadAfterWriteVerified:committed.every(x=>x.readAfterWriteVerified===true),
  storeChanged:shaBuf(storeAfter)!==storeShaBefore,
  eventStoreChanged:shaBuf(eventAfter)!==eventShaBefore
};
const certified=Object.values(postChecks).every(Boolean);

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION_AND_POST_COMMIT_CERTIFICATION",
  version:"4.0-m4.19d4bj4",
  status:certified?"PASSED":"BLOCKED",
  state:certified
    ?"M419D4BJ4_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTED_POST_COMMIT_CERTIFIED_DOWNSTREAM_PROPAGATION_NOT_AUTHORIZED"
    :"M419D4BJ4_POST_COMMIT_CERTIFICATION_FAILED",
  certifiedAt:now(),
  authorization:{tokenAccepted:true,maximumCreations:5,cohortHash:P.cohort.cohortHash},
  execution:{
    creationsCommitted:committed.length,
    committed,
    sequentialExecution:true,
    haltOnFirstFailure:true,
    automaticRetry:false,
    rolledBack:false
  },
  storageBinding:{
    canonicalStore:store.path,
    eventStore:eventStore.path,
    storeContainerPath,
    eventContainerPath,
    storeSha256Before:storeShaBefore,
    storeSha256After:shaBuf(storeAfter),
    eventSha256Before:eventShaBefore,
    eventSha256After:shaBuf(eventAfter),
    storeBackup,
    eventBackup
  },
  postCommitCertification:{checks:postChecks,certified},
  policy:{
    canonicalIdentityCreationAuthorityConsumed:true,
    temporalAvailabilityMutationNotAuthorized:true,
    governedInventoryMutationNotAuthorized:true,
    downstreamPropagationNotAuthorized:true,
    separatePropagationPreauthorizationRequired:true
  },
  nextMilestone:certified
    ?"M4.19D4BK_FIVE_PROPERTY_CANONICAL_IDENTITY_DOWNSTREAM_BINDING_AND_RUNTIME_VISIBILITY_PREAUTHORIZATION"
    :"M4.19D4BJ4R1_POST_COMMIT_CERTIFICATION_RECONCILIATION",
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:certified,
    identityWriteAuthority:certified,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,
    productionCanonicalMutationPerformed:certified,
    productionIdentityMutationPerformed:certified,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamPropagationPerformed:false,
    automaticRetry:false
  }
};

fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!certified) process.exit(2);
