#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4BJ4B2_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION";

const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const preauthPath=path.join(ev,"m4-19d4bj4b1c-production-canonical-creation-event-store-path-binding-and-reexecution-repreauthorization.json");
const cohortPath=path.join(ev,"m4-19d4bj3c-r1-five-property-canonical-identity-creation-final-repreauthorization.json");
const out=path.join(ev,"m4-19d4bj4b2-controlled-five-property-canonical-identity-creation-reexecution-and-dual-store-post-commit-certification.json");

const shaBuf=b=>crypto.createHash("sha256").update(b).digest("hex");
const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const now=()=>new Date().toISOString();

function finishBlocked(state,detail={},code=2){
  const result={
    contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B2_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_AND_DUAL_STORE_POST_COMMIT_CERTIFICATION",
    version:"4.0-m4.19d4bj4b2",
    status:"BLOCKED",
    state,
    certifiedAt:now(),
    detail,
    execution:{writesAttempted:0,canonicalCreationsCommitted:0,creationEventsCommitted:0,rolledBack:false},
    nextMilestone:"M4.19D4BJ4B2R1_EXECUTION_PRECHECK_OR_FAILURE_RECONCILIATION",
    safety:{
      networkRequestsPerformed:0,
      temporalMutationPerformed:false,
      governedInventoryMutationPerformed:false,
      downstreamPropagationPerformed:false,
      automaticRetry:false
    }
  };
  fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));
  process.exit(code);
}

if(auth!==REQUIRED_AUTH) finishBlocked("M419D4BJ4B2_EXPLICIT_AUTHORIZATION_TOKEN_REQUIRED",{requiredAuthorizationToken:REQUIRED_AUTH});
for(const p of [preauthPath,cohortPath]) if(!fs.existsSync(p)) finishBlocked("M419D4BJ4B2_REQUIRED_EVIDENCE_MISSING",{path:p});

const P=readJson(preauthPath);
const C=readJson(cohortPath);

if(P.state!=="M419D4BJ4B1C_PRODUCTION_EVENT_STORE_PATH_EXPLICITLY_BOUND_FIVE_PROPERTY_REEXECUTION_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED_BJ4B2_READY")
  finishBlocked("M419D4BJ4B2_BJ4B1C_STATE_MISMATCH",{observed:P.state});

const cohort=C.cohort?.records||[];
if(cohort.length!==5) finishBlocked("M419D4BJ4B2_EXACT_FIVE_RECORD_COHORT_REQUIRED",{count:cohort.length});
if(P.cohort?.cohortHash!==C.cohort?.cohortHash) finishBlocked("M419D4BJ4B2_COHORT_HASH_BINDING_MISMATCH");
if(P.cohort?.frozenHashMatches!==true) finishBlocked("M419D4BJ4B2_FROZEN_COHORT_NOT_CERTIFIED");

const canonicalStore=P.productionBinding?.canonicalStore?.path;
const eventStore=P.productionBinding?.creationEventStore?.path;
const eventAdapterPath=P.productionBinding?.adapter?.path;

for(const p of [canonicalStore,eventAdapterPath]) if(!p || !fs.existsSync(p))
  finishBlocked("M419D4BJ4B2_BOUND_RUNTIME_OR_STORE_MISSING",{path:p});

if(path.resolve(eventStore).startsWith(path.resolve(ev)+path.sep))
  finishBlocked("M419D4BJ4B2_EVENT_STORE_CANNOT_BE_EVIDENCE_ARTIFACT",{eventStore});

const adapterSha=shaBuf(fs.readFileSync(eventAdapterPath));
if(adapterSha!==P.productionBinding?.adapter?.sha256)
  finishBlocked("M419D4BJ4B2_EVENT_ADAPTER_SHA_DRIFT",{expected:P.productionBinding?.adapter?.sha256,observed:adapterSha});

console.log("[BJ4B2] explicit authorization accepted");
console.log(`[BJ4B2] frozen cohort hash: ${P.cohort.cohortHash}`);
console.log(`[BJ4B2] canonical store: ${canonicalStore}`);
console.log(`[BJ4B2] creation-event store: ${eventStore}`);
console.log("[BJ4B2] all preflight checks must pass before first production write");

function collectObjects(x,out=[]){
  if(Array.isArray(x)){ for(const v of x) collectObjects(v,out); }
  else if(x&&typeof x==="object"){
    out.push(x);
    for(const v of Object.values(x)) if(v&&typeof v==="object") collectObjects(v,out);
  }
  return out;
}
function findArrays(root,predicate,pathParts=[],hits=[]){
  if(Array.isArray(root)){
    const score=root.reduce((n,x)=>n+(predicate(x)?1:0),0);
    if(score>0) hits.push({path:[...pathParts],score,length:root.length});
    root.forEach((x,i)=>{ if(x&&typeof x==="object") findArrays(x,predicate,[...pathParts,i],hits); });
  } else if(root&&typeof root==="object"){
    for(const [k,v] of Object.entries(root)) if(v&&typeof v==="object") findArrays(v,predicate,[...pathParts,k],hits);
  }
  return hits;
}
function getAt(root,parts){ let x=root; for(const p of parts) x=x[p]; return x; }
function parseCanonical(){
  return JSON.parse(fs.readFileSync(canonicalStore,"utf8"));
}
function chooseCanonicalContainer(root){
  const pred=x=>x&&typeof x==="object"&&typeof x.canonicalPropertyId==="string";
  if(Array.isArray(root)){
    const score=root.reduce((n,x)=>n+(pred(x)?1:0),0);
    if(score>0) return [];
  }
  const hits=findArrays(root,pred).sort((a,b)=>b.score-a.score||b.length-a.length);
  if(!hits.length) return null;
  if(hits.length>1 && hits[0].score===hits[1].score) return null;
  return hits[0].path;
}
function atomicWrite(p,buf){
  const tmp=p+`.bj4b2tmp-${process.pid}`;
  fs.writeFileSync(tmp,buf);
  fs.renameSync(tmp,p);
}
function serializeCanonical(root){ return Buffer.from(JSON.stringify(root,null,2)+"\n"); }

const canonicalRootPre=parseCanonical();
const containerPath=chooseCanonicalContainer(canonicalRootPre);
if(containerPath===null) finishBlocked("M419D4BJ4B2_CANONICAL_RECORD_CONTAINER_NOT_UNIQUELY_BOUND");

const preObjects=collectObjects(canonicalRootPre);
const duplicatePreflight=[];
for(const r of cohort){
  const canonicalCount=preObjects.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId).length;
  const sourceCount=preObjects.filter(x=>x?.sourcePropertyId===r.sourcePropertyId).length;
  duplicatePreflight.push({cohortPosition:r.cohortPosition,canonicalPropertyId:r.canonicalPropertyId,sourcePropertyId:r.sourcePropertyId,canonicalCount,sourceCount});
}
if(duplicatePreflight.some(x=>x.canonicalCount!==0||x.sourceCount!==0))
  finishBlocked("M419D4BJ4B2_PREWRITE_DUPLICATE_RECHECK_FAILED",{duplicatePreflight});

const eventExistedBefore=fs.existsSync(eventStore);
if(eventExistedBefore){
  const existingText=fs.readFileSync(eventStore,"utf8");
  if(existingText.trim()){
    const rows=existingText.split(/\r?\n/).filter(Boolean).map((line,i)=>{
      try{return JSON.parse(line)}catch(err){throw new Error(`invalid production event JSONL line ${i+1}: ${err.message}`)}
    });
    for(const r of cohort){
      if(rows.some(x=>x?.canonicalPropertyId===r.canonicalPropertyId||x?.sourcePropertyId===r.sourcePropertyId))
        finishBlocked("M419D4BJ4B2_PREWRITE_EVENT_DUPLICATE_RECHECK_FAILED",{canonicalPropertyId:r.canonicalPropertyId,sourcePropertyId:r.sourcePropertyId});
    }
  }
}

const mod=await import(pathToFileURL(eventAdapterPath).href+"?v="+Date.now());
if(typeof mod.buildGovernedCanonicalCreationEventStoreAdapter!=="function")
  finishBlocked("M419D4BJ4B2_EVENT_ADAPTER_FACTORY_MISSING");

const canonicalBefore=fs.readFileSync(canonicalStore);
const eventBefore=eventExistedBefore?fs.readFileSync(eventStore):null;
const canonicalShaBefore=shaBuf(canonicalBefore);
const eventShaBefore=eventBefore?shaBuf(eventBefore):null;

const backupDir=path.join(ev,"m4-19d4bj4b2-backups");
fs.mkdirSync(backupDir,{recursive:true});
const canonicalBackup=path.join(backupDir,"canonical-property-identity-data.pre-bj4b2.bak");
fs.writeFileSync(canonicalBackup,canonicalBefore);
let eventBackup=null;
if(eventExistedBefore){
  eventBackup=path.join(backupDir,"canonical-identity-creation-events.pre-bj4b2.bak");
  fs.writeFileSync(eventBackup,eventBefore);
}

const eventAdapter=mod.buildGovernedCanonicalCreationEventStoreAdapter({eventLogPath:eventStore,authorized:true});

let canonicalCommitted=0;
let eventsCommitted=0;
let committed=[];
let failure=null;
let rolledBack=false;

try{
  for(const r of [...cohort].sort((a,b)=>a.cohortPosition-b.cohortPosition)){
    const liveRoot=parseCanonical();
    const liveObjects=collectObjects(liveRoot);
    if(liveObjects.some(x=>x?.canonicalPropertyId===r.canonicalPropertyId))
      throw new Error("DUPLICATE_CANONICAL_IMMEDIATE:"+r.canonicalPropertyId);
    if(liveObjects.some(x=>x?.sourcePropertyId===r.sourcePropertyId))
      throw new Error("DUPLICATE_SOURCE_IMMEDIATE:"+r.sourcePropertyId);

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
        creationMilestone:"M4.19D4BJ4B2"
      },
      idempotencyKey
    };

    const arr=getAt(liveRoot,containerPath);
    if(!Array.isArray(arr)) throw new Error("BOUND_CANONICAL_CONTAINER_NOT_ARRAY");
    arr.push(newRecord);
    atomicWrite(canonicalStore,serializeCanonical(liveRoot));
    canonicalCommitted++;

    const verifyCanonical=collectObjects(parseCanonical()).filter(x=>
      x?.canonicalPropertyId===r.canonicalPropertyId &&
      x?.sourcePropertyId===r.sourcePropertyId &&
      x?.idempotencyKey===idempotencyKey
    );
    if(verifyCanonical.length!==1) throw new Error("CANONICAL_READ_AFTER_WRITE_FAILED:"+r.canonicalPropertyId);

    const creationEvent={
      eventType:"CANONICAL_IDENTITY_CREATED",
      canonicalPropertyId:r.canonicalPropertyId,
      sourcePropertyId:r.sourcePropertyId,
      normalizedAddress:r.address,
      idempotencyKey,
      observationTimestamp:ts,
      authorityReference:r.authorityReference,
      sourceProvenance:{
        cohort:"M4.19D4BJ",
        cohortHash:P.cohort.cohortHash,
        source:"GOVERNED_BASE_INVENTORY"
      },
      identityEvidence:{
        derivationHash:r.derivationHash,
        canonicalAuthorityReference:r.authorityReference,
        executionMilestone:"M4.19D4BJ4B2"
      }
    };

    const append=eventAdapter.appendCreationEvent(creationEvent);
    if(!append?.appended) throw new Error("EVENT_APPEND_FAILED:"+JSON.stringify(append));
    eventsCommitted++;

    const verifyEvent=eventAdapter.readAfterAppend({
      idempotencyKey,
      canonicalPropertyId:r.canonicalPropertyId
    });
    if(!verifyEvent?.verified) throw new Error("EVENT_READ_AFTER_APPEND_FAILED:"+r.canonicalPropertyId);

    committed.push({
      cohortPosition:r.cohortPosition,
      canonicalPropertyId:r.canonicalPropertyId,
      sourcePropertyId:r.sourcePropertyId,
      address:r.address,
      idempotencyKey,
      canonicalReadAfterWriteVerified:true,
      eventReadAfterAppendVerified:true
    });
    console.log(`[BJ4B2] committed ${committed.length}/5: ${r.canonicalPropertyId} — ${r.address}`);
  }
}catch(err){
  failure=String(err?.stack||err);
  try{
    atomicWrite(canonicalStore,canonicalBefore);
    if(eventExistedBefore){
      atomicWrite(eventStore,eventBefore);
    }else if(fs.existsSync(eventStore)){
      fs.unlinkSync(eventStore);
    }
    rolledBack=true;
  }catch(rb){
    failure += "\nROLLBACK_FAILURE:\n"+String(rb?.stack||rb);
  }
}

if(failure){
  const result={
    contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B2_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_AND_DUAL_STORE_POST_COMMIT_CERTIFICATION",
    version:"4.0-m4.19d4bj4b2",
    status:"BLOCKED",
    state:rolledBack?"M419D4BJ4B2_EXECUTION_FAILED_DUAL_STORE_ROLLBACK_CERTIFIED":"M419D4BJ4B2_EXECUTION_FAILED_ROLLBACK_NOT_CERTIFIED",
    certifiedAt:now(),
    execution:{canonicalCreationsCommittedBeforeFailure:canonicalCommitted,creationEventsCommittedBeforeFailure:eventsCommitted,committed,rolledBack,failure},
    storageBinding:{canonicalStore,eventStore,canonicalBackup,eventBackup,eventExistedBefore},
    nextMilestone:"M4.19D4BJ4B2R1_EXECUTION_FAILURE_RECONCILIATION",
    safety:{
      networkRequestsPerformed:0,
      temporalMutationPerformed:false,
      governedInventoryMutationPerformed:false,
      downstreamPropagationPerformed:false,
      automaticRetry:false
    }
  };
  fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));
  process.exit(2);
}

const canonicalAfter=fs.readFileSync(canonicalStore);
const finalCanonicalObjects=collectObjects(parseCanonical());
const finalEvents=fs.existsSync(eventStore)
  ? fs.readFileSync(eventStore,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse)
  : [];

const postChecks={
  exactFiveCanonicalCreations:canonicalCommitted===5,
  exactFiveCreationEvents:eventsCommitted===5,
  eachCanonicalPresentExactlyOnce:cohort.every(r=>finalCanonicalObjects.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId).length===1),
  eachSourcePresentExactlyOnce:cohort.every(r=>finalCanonicalObjects.filter(x=>x?.sourcePropertyId===r.sourcePropertyId).length===1),
  eachCreationEventPresentExactlyOnce:cohort.every(r=>finalEvents.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED"&&x?.canonicalPropertyId===r.canonicalPropertyId).length===1),
  allCanonicalReadAfterWriteVerified:committed.every(x=>x.canonicalReadAfterWriteVerified),
  allEventReadAfterAppendVerified:committed.every(x=>x.eventReadAfterAppendVerified),
  canonicalStoreChanged:shaBuf(canonicalAfter)!==canonicalShaBefore,
  eventStoreCreatedOrChanged:fs.existsSync(eventStore) && (!eventExistedBefore || shaBuf(fs.readFileSync(eventStore))!==eventShaBefore),
  eventStoreIsNotEvidenceArtifact:!path.resolve(eventStore).startsWith(path.resolve(ev)+path.sep)
};
const certified=Object.values(postChecks).every(Boolean);

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B2_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_AND_DUAL_STORE_POST_COMMIT_CERTIFICATION",
  version:"4.0-m4.19d4bj4b2",
  status:certified?"PASSED":"BLOCKED",
  state:certified
    ?"M419D4BJ4B2_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTED_DUAL_STORE_POST_COMMIT_CERTIFIED_DOWNSTREAM_PROPAGATION_NOT_AUTHORIZED"
    :"M419D4BJ4B2_POST_COMMIT_CERTIFICATION_FAILED",
  certifiedAt:now(),
  authorization:{tokenAccepted:true,maximumCanonicalIdentityCreations:5,cohortHash:P.cohort.cohortHash},
  execution:{
    canonicalCreationsCommitted:canonicalCommitted,
    creationEventsCommitted:eventsCommitted,
    committed,
    sequentialExecution:true,
    haltOnFirstFailure:true,
    automaticRetry:false,
    rolledBack:false
  },
  storageBinding:{
    canonicalStore,
    eventStore,
    eventStoreCreatedByExecution:!eventExistedBefore,
    canonicalSha256Before:canonicalShaBefore,
    canonicalSha256After:shaBuf(canonicalAfter),
    eventSha256Before:eventShaBefore,
    eventSha256After:shaBuf(fs.readFileSync(eventStore)),
    canonicalBackup,
    eventBackup
  },
  postCommitCertification:{checks:postChecks,certified},
  policy:{
    canonicalIdentityCreationAuthorityConsumed:true,
    creationEventAppendAuthorityConsumed:true,
    temporalAvailabilityMutationNotAuthorized:true,
    governedInventoryMutationNotAuthorized:true,
    downstreamPropagationNotAuthorized:true,
    separateDownstreamBindingAndVisibilityPreauthorizationRequired:true
  },
  nextMilestone:certified
    ?"M4.19D4BK_FIVE_PROPERTY_CANONICAL_IDENTITY_DOWNSTREAM_BINDING_AND_RUNTIME_VISIBILITY_PREAUTHORIZATION"
    :"M4.19D4BJ4B2R1_POST_COMMIT_CERTIFICATION_RECONCILIATION",
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
    productionEventMutationPerformed:certified,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamPropagationPerformed:false,
    automaticRetry:false
  }
};

fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!certified) process.exit(2);
