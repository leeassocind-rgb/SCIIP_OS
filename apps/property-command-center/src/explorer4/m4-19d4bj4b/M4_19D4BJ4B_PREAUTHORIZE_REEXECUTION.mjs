#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const a3r2Path=path.join(ev,"m4-19d4bj4a3-r2-event-store-binding-state-reconciliation-and-bj4b-readiness.json");
const a2Path=path.join(ev,"m4-19d4bj4a2-canonical-creation-event-store-lineage-reconciliation.json");
const preauthPath=path.join(ev,"m4-19d4bj3c-r1-five-property-canonical-identity-creation-final-repreauthorization.json");
const out=path.join(ev,"m4-19d4bj4b-controlled-five-property-canonical-identity-creation-reexecution-preauthorization.json");

const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const shaBuf=b=>crypto.createHash("sha256").update(b).digest("hex");
const shaFile=p=>shaBuf(fs.readFileSync(p));
const shaJson=x=>shaBuf(Buffer.from(JSON.stringify(x)));
const isEvidencePath=p=>typeof p==="string" && path.resolve(p).startsWith(path.resolve(ev)+path.sep);

for(const p of [a3r2Path,a2Path,preauthPath]) if(!fs.existsSync(p)) throw new Error("required evidence missing: "+p);

const A3=readJson(a3r2Path);
const A2=readJson(a2Path);
const P=readJson(preauthPath);

if(A3.state!=="M419D4BJ4A3_R2_EXISTING_CANONICAL_EVENT_STORE_BINDING_PRESERVED_NEW_STORE_DESIGN_NOT_REQUIRED_BJ4B_READY")
  throw new Error(`A3-R2 state mismatch: ${A3.state}`);
if(P.state!=="M419D4BJ3C_R1_EXACT_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZED_BJ4_EXECUTION_AUTHORIZATION_REQUIRED")
  throw new Error(`BJ3C-R1 state mismatch: ${P.state}`);

console.log("[BJ4B] A3-R2 BJ4B readiness accepted");
console.log("[BJ4B] revalidating frozen cohort + physical storage bindings; writes remain OFF");

const cohort=P.cohort?.records||[];
if(cohort.length!==5) throw new Error(`expected frozen five-record cohort, found ${cohort.length}`);
const cohortHash=shaJson(cohort);
if(cohortHash!==P.cohort?.cohortHash) throw new Error("frozen cohort hash mismatch");

// Canonical store must be the high-confidence A1/A2 binding, not inferred anew.
const canonicalStore =
  A3.adjudication?.canonicalStoreBinding?.authoritativeCanonicalStore ||
  A2.canonicalBindingFromA1?.authoritativeCanonicalStore ||
  null;
const runtimeMirror =
  A3.adjudication?.canonicalStoreBinding?.runtimeMirror ||
  A2.canonicalBindingFromA1?.runtimeMirror ||
  null;

if(!canonicalStore || !fs.existsSync(canonicalStore)){
  const result={
    contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_PREAUTHORIZATION",
    version:"4.0-m4.19d4bj4b",status:"BLOCKED",
    state:"M419D4BJ4B_AUTHORITATIVE_CANONICAL_STORE_BINDING_MISSING",
    certifiedAt:new Date().toISOString(),
    nextMilestone:"M4.19D4BJ4B1_CANONICAL_STORE_BINDING_RECONCILIATION",
    safety:{productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,networkRequestsPerformed:0,automaticRetry:false}
  };
  fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));
  process.exit(2);
}

// Resolve PHYSICAL event store from A2 payload. Never accept evidence artifacts as physical store.
function collectPossibleEventStores(obj,out=[]){
  if(!obj) return out;
  if(typeof obj==="string"){
    if(path.isAbsolute(obj) && fs.existsSync(obj) && /\.(json|jsonl)$/i.test(obj)) out.push(obj);
  }else if(Array.isArray(obj)){
    for(const x of obj) collectPossibleEventStores(x,out);
  }else if(typeof obj==="object"){
    for(const [k,v] of Object.entries(obj)){
      if(/event.*store|event.*path|authoritativeEventStore|resolvedEventStore|path/i.test(k)){
        collectPossibleEventStores(v,out);
      }else if(typeof v==="object"){
        collectPossibleEventStores(v,out);
      }
    }
  }
  return out;
}

const rawEventPaths=[...new Set([
  ...collectPossibleEventStores(A2.reconciliation),
  ...collectPossibleEventStores(A2),
  ...collectPossibleEventStores(A3.adjudication)
])];

function inspectEventFile(p){
  let text=""; try{text=fs.readFileSync(p,"utf8")}catch{return null}
  return {
    path:p,
    evidencePath:isEvidencePath(p),
    bytes:fs.statSync(p).size,
    sha256:shaFile(p),
    eventTypeCount:(text.match(/"(?:eventType|event|type)"\s*:/g)||[]).length,
    canonicalPropertyIdCount:(text.match(/"canonicalPropertyId"\s*:/g)||[]).length,
    identityCreatedCount:(text.match(/CANONICAL_IDENTITY_CREATED/g)||[]).length,
    idempotencyCount:(text.match(/idempotency/ig)||[]).length,
    jsonl:p.endsWith(".jsonl")
  };
}
const physicalEventCandidates=rawEventPaths
  .filter(p=>!isEvidencePath(p))
  .map(inspectEventFile)
  .filter(Boolean);

for(const x of physicalEventCandidates){
  x.score=
    (x.identityCreatedCount>0?20:0)+
    (x.eventTypeCount>0?5:0)+
    (x.canonicalPropertyIdCount>0?4:0)+
    (x.idempotencyCount>0?2:0)+
    (x.jsonl?1:0);
}
physicalEventCandidates.sort((a,b)=>b.score-a.score||b.identityCreatedCount-a.identityCreatedCount||a.path.localeCompare(b.path));

let physicalEventStore=null;
if(physicalEventCandidates.length===1 && physicalEventCandidates[0].score>=5){
  physicalEventStore=physicalEventCandidates[0].path;
}else if(physicalEventCandidates.length>1 && physicalEventCandidates[0].score>physicalEventCandidates[1].score){
  physicalEventStore=physicalEventCandidates[0].path;
}

// Explicitly record the bad A3-R2 label if it points at evidence.
const a3Label=A3.adjudication?.authoritativeEventStore||null;
const a3LabelIsEvidence=isEvidencePath(a3Label);

if(!physicalEventStore){
  const result={
    contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_PREAUTHORIZATION",
    version:"4.0-m4.19d4bj4b",
    status:"PASSED",
    state:"M419D4BJ4B_PHYSICAL_CANONICAL_EVENT_STORE_NOT_YET_BOUND_BJ4B1_TARGETED_RECONCILIATION_REQUIRED",
    certifiedAt:new Date().toISOString(),
    adjudication:{
      canonicalStoreBound:true,
      authoritativeCanonicalStore:canonicalStore,
      runtimeMirror,
      a3R2AuthoritativeEventStoreLabel:a3Label,
      a3R2LabelIsEvidenceArtifact:a3LabelIsEvidence,
      rawEventPaths,
      physicalEventCandidates,
      physicalEventStore:null,
      conclusion:"A3-R2 preserved event-store binding evidence, but BJ4B will not treat an evidence artifact as the physical production event persistence target."
    },
    cohort:{
      size:5,
      cohortHash,
      frozenHashMatches:true
    },
    policy:{
      evidenceArtifactCannotServeAsPhysicalEventStore:true,
      productionRetryNotAuthorized:true,
      noProductionWrite:true,
      noAutomaticRetry:true
    },
    nextMilestone:"M4.19D4BJ4B1_PHYSICAL_CANONICAL_CREATION_EVENT_STORE_BINDING_RECONCILIATION",
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
  process.exit(0);
}

console.log(`[BJ4B] canonical store: ${canonicalStore}`);
console.log(`[BJ4B] physical event store: ${physicalEventStore}`);

// Read-only duplicate recheck across canonical store.
const canonicalText=fs.readFileSync(canonicalStore,"utf8");
const duplicateChecks=cohort.map(r=>({
  cohortPosition:r.cohortPosition,
  canonicalPropertyId:r.canonicalPropertyId,
  sourcePropertyId:r.sourcePropertyId,
  canonicalIdPresent:canonicalText.includes(r.canonicalPropertyId),
  sourcePropertyIdPresent:canonicalText.includes(r.sourcePropertyId)
}));

const allAbsent=duplicateChecks.every(x=>!x.canonicalIdPresent&&!x.sourcePropertyIdPresent);

// Runtime components required for reexecution.
const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const primitivePath=path.join(app,"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js");
const adapterPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
const componentChecks={
  canonicalIdAuthorityPresent:fs.existsSync(authorityPath),
  firstInsertPrimitivePresent:fs.existsSync(primitivePath),
  productionFirstInsertAdapterPresent:fs.existsSync(adapterPath)
};

const bindingManifest={
  canonicalStore:{
    path:canonicalStore,
    sha256:shaFile(canonicalStore),
    runtimeMirror:runtimeMirror&&fs.existsSync(runtimeMirror)?{
      path:runtimeMirror,
      sha256:shaFile(runtimeMirror),
      byteIdentical:shaFile(runtimeMirror)===shaFile(canonicalStore)
    }:null
  },
  eventStore:{
    path:physicalEventStore,
    sha256:shaFile(physicalEventStore)
  },
  runtimes:{
    canonicalIdAuthority:authorityPath,
    firstInsertPrimitive:primitivePath,
    productionFirstInsertAdapter:adapterPath
  }
};

const executionContract={
  cohortHash,
  exactRecordCount:5,
  maximumCreations:5,
  executionOrder:"COHORT_POSITION_ASCENDING",
  sequentialOnly:true,
  duplicateRecheckImmediatelyBeforeEachInsert:true,
  haltOnFirstFailure:true,
  readAfterWriteAfterEachInsert:true,
  canonicalStoreBackupRequired:true,
  eventStoreBackupRequired:true,
  cohortRollbackRequiredOnAnyFailure:true,
  noAutomaticRetry:true,
  requiredAuthorizationToken:"AUTHORIZE_M419D4BJ4C_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION",
  availabilityMutationAuthorized:false,
  temporalMutationAuthorized:false,
  governedInventoryMutationAuthorized:false,
  downstreamPropagationAuthorized:false
};

const executionBindingHash=shaJson({cohort,bindingManifest,executionContract});

const checks={
  frozenCohortHashMatches:true,
  exactFiveRecords:cohort.length===5,
  authoritativeCanonicalStoreBound:true,
  physicalEventStoreBound:true,
  physicalEventStoreNotEvidenceArtifact:!isEvidencePath(physicalEventStore),
  allFiveStillAbsentFromCanonicalStore:allAbsent,
  ...componentChecks,
  productionExecutionNotYetPerformed:true
};
const ready=Object.values(checks).every(Boolean);

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_PREAUTHORIZATION",
  version:"4.0-m4.19d4bj4b",
  status:ready?"PASSED":"BLOCKED",
  state:ready
    ?"M419D4BJ4B_FIVE_PROPERTY_REEXECUTION_PREAUTHORIZED_PHYSICAL_STORAGE_BINDINGS_CERTIFIED_BJ4C_AUTHORIZATION_REQUIRED"
    :"M419D4BJ4B_REEXECUTION_PREAUTHORIZATION_BLOCKED",
  certifiedAt:new Date().toISOString(),
  cohort:{size:5,cohortHash,records:cohort},
  duplicateChecks,
  storageBinding:bindingManifest,
  executionContract,
  executionBindingHash,
  checks,
  policy:{
    BJ4BlockedAttemptHadZeroWrites:true,
    priorAuthorizationNotAutomaticallyReused:true,
    freshBJ4CExplicitAuthorizationRequired:true,
    physicalEventStoreMustNotBeEvidenceArtifact:true,
    noProductionWriteInBJ4B:true,
    noAutomaticRetry:true
  },
  nextMilestone:ready
    ?"M4.19D4BJ4C_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_AND_POST_COMMIT_CERTIFICATION"
    :"M4.19D4BJ4B2_REEXECUTION_PREAUTHORIZATION_RECONCILIATION",
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
if(!ready) process.exit(2);
