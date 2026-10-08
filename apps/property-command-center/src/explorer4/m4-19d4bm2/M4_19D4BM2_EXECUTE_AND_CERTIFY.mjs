#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const token=process.argv[3]||"";
const REQUIRED_TOKEN="AUTHORIZE_M419D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT";

const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

function need(p){ if(!fs.existsSync(p)) throw new Error("required input missing: "+p); return p; }
function sha(p){ return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }
function atomicWriteFile(file,buf){
  const tmp=file+".tmp-"+process.pid+"-"+Date.now();
  fs.writeFileSync(tmp,buf);
  fs.renameSync(tmp,file);
}
function copyRestore(src,dst){
  const buf=fs.readFileSync(src);
  atomicWriteFile(dst,buf);
}
function now(){ return new Date().toISOString(); }

const ePath=need(path.join(ev,"m4-19d4bm2e-r1-production-object-store-bridge-compatibility-and-ten-property-execution-repreauthorization.json"));
const r3Path=need(path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json"));
const canonicalPath=need(path.join(app,"src/production-validation/canonical-property-identity-data.json"));
const eventPath=need(path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl"));
const runtimePath=need(path.join(app,"public/production-validation-data/canonical-property-identity-data.json"));
const inventoryPath=need(path.join(app,"public/explorer/governed-base-inventory.json"));
const bridgePath=need(path.join(app,"src/runtime/GovernedCanonicalObjectStoreFirstInsertBridgeRuntime.js"));
const eventAdapterPath=need(path.join(app,"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js"));
const out=path.join(ev,"m4-19d4bm2-controlled-ten-property-canonical-identity-creation-and-dual-store-commit-execution.json");

const E=readJson(ePath);
const R3=readJson(r3Path);

if(E.state!=="M419D4BM2E_R1_PRODUCTION_OBJECT_STORE_BRIDGE_COMPATIBLE_EXACT_TEN_PROPERTY_EXECUTION_REPREAUTHORIZED_BM2_COMMIT_READY")
  throw new Error("BM2E-R1 state mismatch");
if(E.status!=="PASSED") throw new Error("BM2E-R1 not passed");
if(token!==REQUIRED_TOKEN) throw new Error("EXPLICIT_BM2_AUTHORIZATION_TOKEN_REQUIRED");

const expectedManifestHash="efc78188977e12ded0cf3d3a72dc593d1c44b36e3cc27c5bebe27eca20fd973a";
const expectedCohortHash="238ec8b8fb135de1cff80b773ed73662cce4f68b96b2b8a8dbbb54898c40de4d";

const frozen=R3?.executionManifest?.manifest;
const manifestRecords=frozen?.records;
const cohortRecords=R3?.cohort?.records;
if(!Array.isArray(manifestRecords)||manifestRecords.length!==10) throw new Error("frozen ten-record manifest unresolved");
if(!Array.isArray(cohortRecords)||cohortRecords.length!==10) throw new Error("R3 ten-record cohort detail unresolved");
if(R3.executionManifest?.executionManifestHash!==expectedManifestHash) throw new Error("execution manifest hash mismatch");
if(R3.cohort?.cohortHash!==expectedCohortHash || frozen?.cohortHash!==expectedCohortHash) throw new Error("cohort hash mismatch");

const before={
 canonical:sha(canonicalPath),
 events:sha(eventPath),
 runtime:sha(runtimePath),
 inventory:sha(inventoryPath),
 bridge:sha(bridgePath),
 eventAdapter:sha(eventAdapterPath)
};

if(before.canonical!==frozen.canonicalStore?.sha256) throw new Error("canonical store drift before BM2");
if(before.events!==frozen.eventStore?.sha256) throw new Error("event store drift before BM2");
if(before.runtime!==frozen.runtimeMirror?.sha256) throw new Error("runtime mirror drift before BM2");
if(before.inventory!==frozen.inventory?.sha256) throw new Error("inventory drift before BM2");
if(before.bridge!==E.prerequisite?.bridgeSourceSha256) throw new Error("bridge runtime drift before BM2");

const backupsDir=path.join(ev,"m4-19d4bm2-backups");
fs.mkdirSync(backupsDir,{recursive:true});
const canonicalBackup=path.join(backupsDir,"canonical-property-identity-data.pre-bm2.bak");
const eventBackup=path.join(backupsDir,"canonical-identity-creation-events.pre-bm2.bak");
fs.copyFileSync(canonicalPath,canonicalBackup);
fs.copyFileSync(eventPath,eventBackup);

const bridgeMod=await import(pathToFileURL(bridgePath).href+"?bm2="+Date.now());
const eventMod=await import(pathToFileURL(eventAdapterPath).href+"?bm2="+Date.now());

if(typeof bridgeMod.buildGovernedCanonicalObjectStoreFirstInsertBridge!=="function") throw new Error("bridge factory missing");
if(typeof eventMod.buildGovernedCanonicalCreationEventStoreAdapter!=="function") throw new Error("event adapter factory missing");

const bridge=bridgeMod.buildGovernedCanonicalObjectStoreFirstInsertBridge({
  canonicalStorePath:canonicalPath,
  authorizationToken:REQUIRED_TOKEN
});
const eventAdapter=eventMod.buildGovernedCanonicalCreationEventStoreAdapter({
  eventLogPath:eventPath,
  authorized:true
});

for(const k of ["preflightFirstInsert","atomicInsertCanonicalIdentity","readAfterWrite"])
  if(typeof bridge[k]!=="function") throw new Error("bridge method missing: "+k);
for(const k of ["lookupByIdempotencyKey","lookupByCanonicalPropertyId","appendCreationEvent","readAfterAppend"])
  if(typeof eventAdapter[k]!=="function") throw new Error("event adapter method missing: "+k);

const detailBySource=new Map(cohortRecords.map(r=>[r.sourcePropertyId,r]));
const committed=[];

function buildInput(m){
  const d=detailBySource.get(m.sourcePropertyId);
  if(!d) throw new Error("cohort detail missing for "+m.sourcePropertyId);
  if(d.canonicalPropertyId!==m.canonicalPropertyId) throw new Error("canonical mismatch between R3 cohort and frozen manifest");
  if(d.idempotencyKey!==m.idempotencyKey) throw new Error("idempotency mismatch between R3 cohort and frozen manifest");

  return {
    canonicalPropertyId:m.canonicalPropertyId,
    sourcePropertyId:m.sourcePropertyId,
    normalizedAddress:m.address,
    sourceProvenance:d.sourceProvenance,
    identityEvidence:d.identityEvidence,
    authorityReference:m.authorityReference,
    derivationHash:m.derivationHash,
    idempotencyKey:m.idempotencyKey,
    observationTimestamp:now()
  };
}

function currentCollisions(input){
  const root=readJson(canonicalPath);
  const sourceAlias=root.aliasLedger.filter(x=>x?.sourcePropertyId===input.sourcePropertyId).length;
  const sourceEvents=root.events.filter(x=>x?.sourcePropertyId===input.sourcePropertyId).length;
  const canonicalIdentities=root.identities.filter(x=>x?.canonicalPropertyId===input.canonicalPropertyId).length;
  const canonicalAliases=root.aliasLedger.filter(x=>x?.canonicalPropertyId===input.canonicalPropertyId).length;
  const canonicalEvents=root.events.filter(x=>x?.canonicalPropertyId===input.canonicalPropertyId).length;
  const extByKey=eventAdapter.lookupByIdempotencyKey(input.idempotencyKey);
  const extByCanonical=eventAdapter.lookupByCanonicalPropertyId(input.canonicalPropertyId);
  return {
    sourceAlias,sourceEvents,canonicalIdentities,canonicalAliases,canonicalEvents,
    externalIdempotencyCount:extByKey?1:0,
    externalCanonicalCount:Array.isArray(extByCanonical)?extByCanonical.length:(extByCanonical?1:0),
    clear:sourceAlias===0&&sourceEvents===0&&canonicalIdentities===0&&canonicalAliases===0&&canonicalEvents===0&&!extByKey&&(!extByCanonical||extByCanonical.length===0)
  };
}

let failure=null;
try{
  // Full-cohort preflight before first write.
  const allInputs=manifestRecords.map(buildInput);
  const preflights=allInputs.map(input=>({
    sourcePropertyId:input.sourcePropertyId,
    canonicalPropertyId:input.canonicalPropertyId,
    bridge:bridge.preflightFirstInsert(input),
    collisions:currentCollisions(input)
  }));
  if(!preflights.every(x=>x.bridge?.ready===true && x.collisions.clear===true))
    throw new Error("FULL_COHORT_PREFLIGHT_FAILED:"+JSON.stringify(preflights));

  for(let i=0;i<allInputs.length;i++){
    const input=allInputs[i];

    // Mandatory immediate duplicate recheck.
    const immediate=currentCollisions(input);
    if(!immediate.clear) throw new Error("IMMEDIATE_DUPLICATE_RECHECK_FAILED:"+JSON.stringify({i:i+1,immediate}));

    const canonicalCommit=bridge.atomicInsertCanonicalIdentity(input);
    if(!canonicalCommit?.committed) throw new Error("CANONICAL_COMMIT_FAILED:"+JSON.stringify(canonicalCommit));

    const canonicalRead=bridge.readAfterWrite({
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      idempotencyKey:input.idempotencyKey
    });
    if(!canonicalRead?.verified) throw new Error("CANONICAL_READ_AFTER_WRITE_FAILED");

    const externalEvent={
      eventType:"CANONICAL_IDENTITY_CREATED",
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      normalizedAddress:input.normalizedAddress,
      idempotencyKey:input.idempotencyKey,
      observationTimestamp:input.observationTimestamp,
      authorityReference:input.authorityReference,
      sourceProvenance:input.sourceProvenance,
      identityEvidence:input.identityEvidence
    };

    const eventCommit=eventAdapter.appendCreationEvent(externalEvent);
    if(!eventCommit?.appended) throw new Error("EXTERNAL_EVENT_APPEND_FAILED:"+JSON.stringify(eventCommit));

    const eventRead=eventAdapter.readAfterAppend({
      idempotencyKey:input.idempotencyKey,
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId
    });

    // Accept the adapter's explicit verification result, and independently verify persisted event.
    const persistedByKey=eventAdapter.lookupByIdempotencyKey(input.idempotencyKey);
    const persistedByCanonical=eventAdapter.lookupByCanonicalPropertyId(input.canonicalPropertyId);
    const independentEventVerified=
      !!persistedByKey &&
      persistedByKey.canonicalPropertyId===input.canonicalPropertyId &&
      persistedByKey.sourcePropertyId===input.sourcePropertyId &&
      Array.isArray(persistedByCanonical) &&
      persistedByCanonical.filter(x=>x?.idempotencyKey===input.idempotencyKey).length===1;

    const eventReadVerified=
      eventRead?.verified===true ||
      eventRead?.appended===true ||
      eventRead?.state==="CANONICAL_CREATION_EVENT_READ_AFTER_APPEND_VERIFIED" ||
      independentEventVerified;

    if(!eventReadVerified || !independentEventVerified) throw new Error("EXTERNAL_EVENT_READ_AFTER_APPEND_FAILED");

    committed.push({
      cohortPosition:i+1,
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      address:input.normalizedAddress,
      idempotencyKey:input.idempotencyKey,
      canonicalReadAfterWriteVerified:true,
      externalEventReadAfterAppendVerified:true
    });

    console.log(`[BM2] committed ${i+1}/10: ${input.canonicalPropertyId} — ${input.normalizedAddress}`);
  }
}catch(e){
  failure=String(e?.stack||e);
}

if(failure){
  // Cohort-level rollback: restore both production stores to exact pre-BM2 bytes.
  copyRestore(canonicalBackup,canonicalPath);
  copyRestore(eventBackup,eventPath);

  const rollback={
    canonicalRestored:sha(canonicalPath)===before.canonical,
    eventStoreRestored:sha(eventPath)===before.events
  };

  const R={
    contract:"SCIIP_EXPLORER_4_M4_19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION",
    version:"4.0-m4.19d4bm2",
    status:"BLOCKED",
    state:"M419D4BM2_CONTROLLED_TEN_PROPERTY_COMMIT_FAILED_COHORT_ROLLED_BACK",
    certifiedAt:now(),
    failure,
    execution:{
      attempted:true,
      committedBeforeFailure:committed.length,
      cohortRollbackPerformed:true,
      rollback
    },
    storageBinding:{canonicalPath,eventPath,canonicalBackup,eventBackup},
    safety:{
      networkRequestsPerformed:0,
      productionCanonicalMutationPerformed:false,
      productionIdentityMutationPerformed:false,
      productionEventMutationPerformed:false,
      temporalMutationPerformed:false,
      governedInventoryMutationPerformed:false,
      downstreamPropagationPerformed:false,
      automaticRetry:false
    }
  };
  fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
  console.log(JSON.stringify(R,null,2));
  process.exit(2);
}

const after={
 canonical:sha(canonicalPath),
 events:sha(eventPath),
 runtime:sha(runtimePath),
 inventory:sha(inventoryPath),
 bridge:sha(bridgePath),
 eventAdapter:sha(eventAdapterPath)
};

const finalRoot=readJson(canonicalPath);
const finalExternal=fs.readFileSync(eventPath,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);

const certification=committed.map(c=>({
  ...c,
  identityCount:finalRoot.identities.filter(x=>x?.canonicalPropertyId===c.canonicalPropertyId).length,
  aliasCount:finalRoot.aliasLedger.filter(x=>x?.canonicalPropertyId===c.canonicalPropertyId&&x?.sourcePropertyId===c.sourcePropertyId).length,
  canonicalEventCount:finalRoot.events.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED"&&x?.canonicalPropertyId===c.canonicalPropertyId&&x?.sourcePropertyId===c.sourcePropertyId&&x?.idempotencyKey===c.idempotencyKey).length,
  externalEventCount:finalExternal.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED"&&x?.canonicalPropertyId===c.canonicalPropertyId&&x?.sourcePropertyId===c.sourcePropertyId&&x?.idempotencyKey===c.idempotencyKey).length
}));

const checks={
  explicitAuthorizationAccepted:token===REQUIRED_TOKEN,
  exactTenCommitted:committed.length===10,
  exactTenIdentities:certification.every(x=>x.identityCount===1),
  exactTenAliases:certification.every(x=>x.aliasCount===1),
  exactTenCanonicalEvents:certification.every(x=>x.canonicalEventCount===1),
  exactTenExternalCreationEvents:certification.every(x=>x.externalEventCount===1),
  allCanonicalReadAfterWriteVerified:certification.every(x=>x.canonicalReadAfterWriteVerified),
  allExternalEventReadAfterAppendVerified:certification.every(x=>x.externalEventReadAfterAppendVerified),
  canonicalStoreChanged:after.canonical!==before.canonical,
  externalEventStoreChanged:after.events!==before.events,
  runtimeMirrorUnchanged:after.runtime===before.runtime,
  governedInventoryUnchanged:after.inventory===before.inventory,
  bridgeRuntimeUnchanged:after.bridge===before.bridge,
  externalEventAdapterUnchanged:after.eventAdapter===before.eventAdapter,
  noRollbackRequired:true
};
const passed=Object.values(checks).every(Boolean);

const R={
  contract:"SCIIP_EXPLORER_4_M4_19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION",
  version:"4.0-m4.19d4bm2",
  status:passed?"PASSED":"BLOCKED",
  state:passed
    ?"M419D4BM2_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_DUAL_STORE_COMMIT_CERTIFIED_RUNTIME_PROPAGATION_NOT_AUTHORIZED"
    :"M419D4BM2_POST_COMMIT_CERTIFICATION_BLOCKED",
  certifiedAt:now(),
  authorization:{
    tokenAccepted:true,
    authorizationScope:"EXACT_FROZEN_TEN_PROPERTY_MANIFEST_ONLY",
    executionManifestHash:expectedManifestHash,
    cohortHash:expectedCohortHash,
    maximumCanonicalIdentityCreations:10
  },
  execution:{
    canonicalIdentityCreationsCommitted:10,
    externalCreationEventsCommitted:10,
    sequentialExecution:true,
    haltOnFirstFailure:true,
    immediateDuplicateRecheck:true,
    automaticRetry:false,
    rolledBack:false,
    committed:certification
  },
  storageBinding:{
    canonicalStore:canonicalPath,
    externalCreationEventStore:eventPath,
    canonicalBackup,
    eventBackup,
    before,
    after
  },
  checks,
  policy:{
    canonicalIdentityCreationAuthorityConsumed:true,
    externalCreationEventAppendAuthorityConsumed:true,
    runtimePropagationAuthorized:false,
    browserCertificationAuthorized:false,
    temporalMutationAuthorized:false,
    governedInventoryMutationAuthorized:false,
    broadScaleOutAuthorized:false,
    separateRuntimePropagationPreauthorizationRequired:true
  },
  nextMilestone:passed
    ?"M4.19D4BN_TEN_PROPERTY_RUNTIME_MIRROR_PROPAGATION_AND_BROWSER_VISIBILITY_PREAUTHORIZATION"
    :"M4.19D4BM2_R1_POST_COMMIT_RECONCILIATION",
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
    productionCanonicalMutationPerformed:true,
    productionIdentityMutationPerformed:true,
    productionEventMutationPerformed:true,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamPropagationPerformed:false,
    automaticRetry:false
  }
};

fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!passed) process.exit(2);
