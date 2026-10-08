#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj4b2-controlled-five-property-canonical-identity-creation-reexecution-and-dual-store-post-commit-certification.json");
const out=path.join(ev,"m4-19d4bk-five-property-canonical-identity-downstream-binding-and-runtime-visibility-preauthorization.json");

if(!fs.existsSync(prior)) throw new Error("BJ4B2 evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
const required="M419D4BJ4B2_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTED_DUAL_STORE_POST_COMMIT_CERTIFIED_DOWNSTREAM_PROPAGATION_NOT_AUTHORIZED";
if(P.state!==required) throw new Error("BJ4B2 state mismatch: "+P.state);

const committed=P.execution?.committed||[];
if(committed.length!==5) throw new Error("exact five committed identities required");

console.log("[BK] BJ4B2 dual-store post-commit certification accepted");
console.log("[BK] tracing downstream/runtime consumption paths read-only");
console.log("[BK] propagation and UI mutation remain OFF");

const ids=committed.map(x=>x.canonicalPropertyId);
const sourceIds=committed.map(x=>x.sourcePropertyId);
const addresses=committed.map(x=>x.address);

function walk(d,out=[]){
  if(!fs.existsSync(d)) return out;
  for(const ent of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage","explorer4"].includes(ent.name)) continue;
      walk(p,out);
    }else if(/\.(?:js|mjs|cjs|jsx|ts|tsx|json|jsonl)$/.test(ent.name)){
      out.push(p);
    }
  }
  return out;
}

const roots=[
  path.join(app,"src/runtime"),
  path.join(app,"src/broker-product"),
  path.join(app,"src/production-validation"),
  path.join(app,"public"),
  path.join(app,"tools"),
  path.join(app,"server")
].filter(fs.existsSync);

const files=[...new Set(roots.flatMap(r=>walk(r,[])))];

const refs=[];
for(const f of files){
  let t=""; try{t=fs.readFileSync(f,"utf8")}catch{continue}
  const lower=t.toLowerCase();
  let score=0;
  const signals={
    canonicalPropertyId:/canonicalPropertyId/.test(t),
    sourcePropertyId:/sourcePropertyId/.test(t),
    governedRuntime:/governed.*runtime|runtime.*governed/i.test(t),
    explorer:/explorer/i.test(t),
    propertySearch:/search.*property|property.*search/i.test(t),
    productionValidation:/production-validation/.test(t),
    canonicalIdentityData:/canonical-property-identity-data/.test(t),
    fetch:/fetch\(|readFile|import\s/i.test(t),
    write:/writeFile|appendFile|renameSync|atomicWrite/i.test(t)
  };
  if(signals.canonicalPropertyId) score+=5;
  if(signals.sourcePropertyId) score+=3;
  if(signals.governedRuntime) score+=4;
  if(signals.explorer) score+=3;
  if(signals.propertySearch) score+=2;
  if(signals.productionValidation) score+=3;
  if(signals.canonicalIdentityData) score+=5;
  if(signals.fetch) score+=1;
  if(signals.write) score+=1;
  const directIds=ids.filter(id=>t.includes(id));
  const directSources=sourceIds.filter(id=>t.includes(id));
  const directAddresses=addresses.filter(a=>t.includes(a));
  score+=directIds.length*20+directSources.length*10+directAddresses.length*5;
  if(score>=8){
    refs.push({
      path:path.relative(app,f),
      score,
      signals,
      directCanonicalIds:directIds,
      directSourceIds:directSources,
      directAddresses
    });
  }
}
refs.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

const candidateSurfaces=[];
for(const r of refs){
  const p=path.join(app,r.path);
  if(!fs.existsSync(p)) continue;
  if(!/\.(json|jsonl)$/.test(p)) continue;
  let t=""; try{t=fs.readFileSync(p,"utf8")}catch{continue}
  const c={
    path:r.path,
    score:r.score,
    canonicalMatches:ids.filter(id=>t.includes(id)),
    sourceMatches:sourceIds.filter(id=>t.includes(id)),
    addressMatches:addresses.filter(a=>t.includes(a)),
    likelyRuntimeSurface:/public\/|runtime|production-validation/i.test(r.path),
    evidence:false
  };
  c.totalTargetMatches=c.canonicalMatches.length+c.sourceMatches.length+c.addressMatches.length;
  candidateSurfaces.push(c);
}
candidateSurfaces.sort((a,b)=>b.totalTargetMatches-a.totalTargetMatches||b.score-a.score||a.path.localeCompare(b.path));

const consumerCandidates=refs.filter(r=>
  !/\.(json|jsonl)$/.test(r.path) &&
  (r.signals.explorer||r.signals.governedRuntime||r.signals.propertySearch||r.signals.canonicalIdentityData)
);

const checks={
  exactFiveCommitted:true,
  allCanonicalIdsDistinct:new Set(ids).size===5,
  allSourceIdsDistinct:new Set(sourceIds).size===5,
  canonicalStoreCertified:P.postCommitCertification?.certified===true,
  exactFiveCanonicalCreations:P.execution?.canonicalCreationsCommitted===5,
  exactFiveCreationEvents:P.execution?.creationEventsCommitted===5,
  downstreamPropagationStillUnauthorized:P.policy?.downstreamPropagationNotAuthorized===true,
  runtimeOrExplorerConsumersDiscovered:consumerCandidates.length>0
};

const ready=Object.values(checks).every(Boolean);

const bindingContract={
  cohortHash:P.authorization?.cohortHash,
  canonicalIds:ids,
  sourcePropertyIds:sourceIds,
  addresses,
  requirements:{
    preserveCanonicalIdentityExactly:true,
    preserveSourcePropertyIdExactly:true,
    preserveAddressBindingExactly:true,
    noDuplicateRuntimeVisibility:true,
    runtimeMaterializationMustBeDeterministic:true,
    publicOrRuntimeMirrorMustNotBecomeWriteAuthority:true,
    sourceCanonicalStoreRemainsAuthoritative:true,
    eventStoreRemainsAppendOnlyAuditAuthority:true,
    downstreamPropagationRequiresSeparateAuthorization:true,
    browserVisibilityCertificationRequiredAfterPropagation:true
  }
};
const bindingHash=crypto.createHash("sha256").update(JSON.stringify(bindingContract)).digest("hex");

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BK_FIVE_PROPERTY_CANONICAL_IDENTITY_DOWNSTREAM_BINDING_AND_RUNTIME_VISIBILITY_PREAUTHORIZATION",
  version:"4.0-m4.19d4bk",
  status:ready?"PASSED":"BLOCKED",
  state:ready
    ?"M419D4BK_FIVE_PROPERTY_DOWNSTREAM_BINDING_AND_RUNTIME_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED"
    :"M419D4BK_DOWNSTREAM_BINDING_PREAUTHORIZATION_BLOCKED_RECONCILIATION_REQUIRED",
  certifiedAt:new Date().toISOString(),
  sourceCertification:{
    canonicalCreationsCommitted:P.execution?.canonicalCreationsCommitted,
    creationEventsCommitted:P.execution?.creationEventsCommitted,
    cohortHash:P.authorization?.cohortHash,
    canonicalStore:P.storageBinding?.canonicalStore,
    eventStore:P.storageBinding?.eventStore
  },
  cohort:{
    size:5,
    records:committed
  },
  discovery:{
    filesInspected:files.length,
    topReferences:refs.slice(0,60),
    candidateRuntimeSurfaces:candidateSurfaces.slice(0,30),
    consumerCandidates:consumerCandidates.slice(0,30)
  },
  checks,
  preauthorization:{
    ready,
    executionAuthorized:false,
    maximumProperties:5,
    bindingContract,
    bindingHash
  },
  policy:{
    canonicalStoreImmutableDuringDownstreamBinding:true,
    eventStoreImmutableDuringDownstreamBinding:true,
    temporalMutationProhibited:true,
    governedInventoryMutationProhibited:true,
    uiMutationProhibited:true,
    networkRequestsProhibited:true,
    explicitBK1ExecutionAuthorizationRequired:true,
    postPropagationRuntimeParityCertificationRequired:true
  },
  nextMilestone:ready
    ?"M4.19D4BK1_CONTROLLED_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTION_AND_RUNTIME_PARITY_CERTIFICATION"
    :"M4.19D4BK_R1_DOWNSTREAM_CONSUMPTION_PATH_RECONCILIATION",
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
    productionIdentityMutationPerformed:false,
    productionEventMutationPerformed:false,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamPropagationPerformed:false,
    uiMutationPerformed:false,
    automaticRetry:false
  }
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!ready) process.exit(2);
