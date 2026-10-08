#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const token=process.argv[3]||"";
const AUTH="AUTHORIZE_M419D4BK1_R1_CONTROLLED_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTION";

const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const bk=path.join(ev,"m4-19d4bk-five-property-canonical-identity-downstream-binding-and-runtime-visibility-preauthorization.json");
const out=path.join(ev,"m4-19d4bk1-r1-controlled-five-property-downstream-binding-execution-and-runtime-parity-certification.json");

function emitBlocked(state,detail={},code=2){
  const R={
    contract:"SCIIP_EXPLORER_4_M4_19D4BK1_R1_CONTROLLED_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTION_AND_RUNTIME_PARITY_CERTIFICATION",
    version:"4.0-m4.19d4bk1-r1",
    status:"BLOCKED",
    state,
    certifiedAt:new Date().toISOString(),
    detail,
    execution:{writesAttempted:0,recordsBound:0},
    safety:{
      productionCanonicalMutationPerformed:false,
      productionEventMutationPerformed:false,
      governedInventoryMutationPerformed:false,
      temporalMutationPerformed:false,
      networkRequestsPerformed:0,
      automaticRetry:false
    }
  };
  fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
  console.log(JSON.stringify(R,null,2));
  process.exit(code);
}

if(token!==AUTH) emitBlocked("M419D4BK1_R1_EXPLICIT_AUTHORIZATION_REQUIRED",{requiredAuthorizationToken:AUTH});
if(!fs.existsSync(bk)) emitBlocked("M419D4BK1_R1_BK_EVIDENCE_MISSING",{path:bk});

const B=JSON.parse(fs.readFileSync(bk,"utf8"));
if(B.state!=="M419D4BK_FIVE_PROPERTY_DOWNSTREAM_BINDING_AND_RUNTIME_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
  emitBlocked("M419D4BK1_R1_BK_STATE_MISMATCH",{observed:B.state});
if(!B.preauthorization?.ready || B.preauthorization?.maximumProperties!==5)
  emitBlocked("M419D4BK1_R1_BK_PREAUTHORIZATION_NOT_READY");

const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const publicCanonical=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventory=path.join(app,"public/explorer/governed-base-inventory.json");
const events=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");

for(const p of [canonical,publicCanonical,inventory,events]) if(!fs.existsSync(p))
  emitBlocked("M419D4BK1_R1_REQUIRED_BOUND_FILE_MISSING",{path:p});

const cohort=B.cohort?.records||[];
if(cohort.length!==5) emitBlocked("M419D4BK1_R1_EXACT_FIVE_RECORD_COHORT_REQUIRED",{count:cohort.length});

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const before={
  canonical:sha(canonical),
  events:sha(events),
  publicCanonical:sha(publicCanonical),
  inventory:sha(inventory)
};

function isCanonicalRecord(x){
  return !!(x && typeof x==="object" && !Array.isArray(x) &&
    (typeof x.canonicalPropertyId==="string" || typeof x.canonicalId==="string"));
}
function isSourceRecord(x){
  return !!(x && typeof x==="object" && !Array.isArray(x) &&
    (typeof x.sourcePropertyId==="string" || typeof x.sourceId==="string" || typeof x.propertyId==="string"));
}
function findCandidateArrays(root,pathParts=[],hits=[]){
  if(Array.isArray(root)){
    const canonicalCount=root.reduce((n,x)=>n+(isCanonicalRecord(x)?1:0),0);
    const sourceCount=root.reduce((n,x)=>n+(isSourceRecord(x)?1:0),0);
    if(canonicalCount>0 || sourceCount>0){
      hits.push({path:[...pathParts],length:root.length,canonicalCount,sourceCount,score:canonicalCount*10+sourceCount});
    }
    root.forEach((x,i)=>{ if(x && typeof x==="object") findCandidateArrays(x,[...pathParts,i],hits); });
  }else if(root && typeof root==="object"){
    for(const [k,v] of Object.entries(root)){
      if(v && typeof v==="object") findCandidateArrays(v,[...pathParts,k],hits);
    }
  }
  return hits;
}
function getAt(root,parts){
  let x=root;
  for(const p of parts) x=x[p];
  return x;
}
function chooseContainer(root,label){
  const hits=findCandidateArrays(root).sort((a,b)=>b.score-a.score||b.canonicalCount-a.canonicalCount||b.sourceCount-a.sourceCount||b.length-a.length);
  if(!hits.length) throw new Error(`${label}: no canonical/source record array discovered`);
  if(hits.length>1 && hits[0].score===hits[1].score && JSON.stringify(hits[0].path)!==JSON.stringify(hits[1].path)){
    throw new Error(`${label}: ambiguous top record arrays: ${JSON.stringify(hits.slice(0,5))}`);
  }
  return {path:hits[0].path,hits:hits.slice(0,10)};
}
function atomicWriteJson(p,obj){
  const tmp=p+`.bk1r1-${process.pid}.tmp`;
  fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+"\n");
  fs.renameSync(tmp,p);
}
function sourceOf(r){ return r?.sourcePropertyId||r?.sourceId||r?.propertyId||null; }
function canonicalOf(r){ return r?.canonicalPropertyId||r?.canonicalId||null; }

console.log("[BK1-R1] explicit authorization accepted");
console.log("[BK1-R1] structurally resolving canonical and public-mirror record containers before any write");

const sourceRoot=JSON.parse(fs.readFileSync(canonical,"utf8"));
const sourceContainer=chooseContainer(sourceRoot,"authoritative canonical store");
const sourceRows=getAt(sourceRoot,sourceContainer.path);
if(!Array.isArray(sourceRows)) emitBlocked("M419D4BK1_R1_CANONICAL_CONTAINER_RESOLUTION_FAILED");

const mirrorRoot=JSON.parse(fs.readFileSync(publicCanonical,"utf8"));
const mirrorContainer=chooseContainer(mirrorRoot,"public canonical runtime mirror");
const mirrorRows=getAt(mirrorRoot,mirrorContainer.path);
if(!Array.isArray(mirrorRows)) emitBlocked("M419D4BK1_R1_PUBLIC_MIRROR_CONTAINER_RESOLUTION_FAILED");

console.log("[BK1-R1] canonical container:",JSON.stringify(sourceContainer.path));
console.log("[BK1-R1] public mirror container:",JSON.stringify(mirrorContainer.path));

const targetSourceIds=new Set(cohort.map(x=>x.sourcePropertyId));
const targetCanonicalIds=new Set(cohort.map(x=>x.canonicalPropertyId));

const sourceMatches=[];
for(const c of cohort){
  const matches=sourceRows.filter(r=>sourceOf(r)===c.sourcePropertyId && canonicalOf(r)===c.canonicalPropertyId);
  sourceMatches.push({
    cohortPosition:c.cohortPosition,
    sourcePropertyId:c.sourcePropertyId,
    canonicalPropertyId:c.canonicalPropertyId,
    matches:matches.length
  });
}
if(sourceMatches.some(x=>x.matches!==1)){
  emitBlocked("M419D4BK1_R1_AUTHORITATIVE_CANONICAL_BINDING_NOT_EXACT",{sourceMatches});
}

// Rebuild only the downstream mirror's canonical-record array.
// Preserve all non-target existing rows and the full surrounding object structure.
const targetSourceRows=new Map();
for(const c of cohort){
  const r=sourceRows.find(x=>sourceOf(x)===c.sourcePropertyId && canonicalOf(x)===c.canonicalPropertyId);
  targetSourceRows.set(c.sourcePropertyId,JSON.parse(JSON.stringify(r)));
}

const beforeTargetMirror=mirrorRows.filter(r=>
  targetSourceIds.has(sourceOf(r)) || targetCanonicalIds.has(canonicalOf(r))
);
const preservedMirrorRows=mirrorRows.filter(r=>
  !targetSourceIds.has(sourceOf(r)) && !targetCanonicalIds.has(canonicalOf(r))
);
const nextMirrorRows=[...preservedMirrorRows];
for(const c of [...cohort].sort((a,b)=>a.cohortPosition-b.cohortPosition)){
  nextMirrorRows.push(targetSourceRows.get(c.sourcePropertyId));
}

// Mutate the already-resolved array in place to preserve exact wrapper shape.
mirrorRows.splice(0,mirrorRows.length,...nextMirrorRows);

atomicWriteJson(publicCanonical,mirrorRoot);

const after={
  canonical:sha(canonical),
  events:sha(events),
  publicCanonical:sha(publicCanonical),
  inventory:sha(inventory)
};

const rereadRoot=JSON.parse(fs.readFileSync(publicCanonical,"utf8"));
const rereadRows=getAt(rereadRoot,mirrorContainer.path);
const cert=cohort.map(c=>{
  const matches=rereadRows.filter(r=>
    sourceOf(r)===c.sourcePropertyId &&
    canonicalOf(r)===c.canonicalPropertyId
  );
  return {
    cohortPosition:c.cohortPosition,
    canonicalPropertyId:c.canonicalPropertyId,
    sourcePropertyId:c.sourcePropertyId,
    address:c.address,
    runtimeMirrorMatches:matches.length
  };
});

const checks={
  exactFiveBound:cert.length===5 && cert.every(x=>x.runtimeMirrorMatches===1),
  noDuplicateRuntimeVisibility:cert.every(x=>x.runtimeMirrorMatches===1),
  canonicalStoreUnchanged:before.canonical===after.canonical,
  eventStoreUnchanged:before.events===after.events,
  governedBaseInventoryUnchanged:before.inventory===after.inventory,
  runtimeMirrorChanged:before.publicCanonical!==after.publicCanonical,
  authoritativeContainerStructurallyResolved:true,
  publicMirrorContainerStructurallyResolved:true,
  sourceBindingsExact:sourceMatches.every(x=>x.matches===1),
  bindingHashPreserved:B.preauthorization?.bindingHash==="dc0039dec1f603148831f3832fa8943f0dda52af483ae39c9d739849a4b266cd"
};
const ok=Object.values(checks).every(Boolean);

const R={
  contract:"SCIIP_EXPLORER_4_M4_19D4BK1_R1_CONTROLLED_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTION_AND_RUNTIME_PARITY_CERTIFICATION",
  version:"4.0-m4.19d4bk1-r1",
  status:ok?"PASSED":"BLOCKED",
  state:ok
    ?"M419D4BK1_R1_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTED_RUNTIME_PARITY_CERTIFIED_BROWSER_VISIBILITY_CERTIFICATION_READY"
    :"M419D4BK1_R1_RUNTIME_PARITY_BLOCKED_RECONCILIATION_REQUIRED",
  certifiedAt:new Date().toISOString(),
  correction:{
    priorBK1Failure:"CANONICAL_DATASET_ROWS_UNRESOLVED_DUE_TO_TOP_LEVEL_FIELD_NAME_ASSUMPTION",
    priorProductionMutationPerformed:false,
    correction:"STRUCTURAL_UNIQUE_RECORD_ARRAY_DISCOVERY",
    wrapperShapePreserved:true
  },
  authorization:{
    tokenAccepted:true,
    maximumProperties:5,
    bindingHash:B.preauthorization?.bindingHash
  },
  containerBinding:{
    authoritativeCanonicalStore:{
      path:canonical,
      recordContainerPath:sourceContainer.path,
      candidateArrays:sourceContainer.hits
    },
    runtimeCanonicalMirror:{
      path:publicCanonical,
      recordContainerPath:mirrorContainer.path,
      candidateArrays:mirrorContainer.hits
    }
  },
  execution:{
    target:"public/production-validation-data/canonical-property-identity-data.json",
    targetRowsRemovedBeforeRebind:beforeTargetMirror.length,
    recordsBound:5,
    certification:cert
  },
  storageHashes:{before,after},
  checks,
  policy:{
    canonicalAuthorityUnchanged:true,
    eventAuditAuthorityUnchanged:true,
    runtimeMirrorIsReadOnlyConsumer:true,
    temporalMutationNotAuthorized:true,
    governedInventoryMutationNotAuthorized:true,
    uiMutationNotAuthorized:true,
    automaticRetry:false
  },
  nextMilestone:ok
    ?"M4.19D4BK2_FIVE_PROPERTY_BROWSER_RUNTIME_VISIBILITY_AND_EXPLORER_READ_PATH_CERTIFICATION"
    :"M4.19D4BK1R2_RUNTIME_PARITY_RECONCILIATION",
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,
    productionCanonicalMutationPerformed:false,
    productionEventMutationPerformed:false,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamRuntimeMirrorMutationPerformed:true,
    uiMutationPerformed:false,
    automaticRetry:false
  }
};

fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!ok) process.exit(2);
