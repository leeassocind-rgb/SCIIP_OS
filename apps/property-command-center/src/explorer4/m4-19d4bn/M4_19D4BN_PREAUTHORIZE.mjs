#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

function need(p){ if(!fs.existsSync(p)) throw new Error("required input missing: "+p); return p; }
function sha(p){ return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }

const bm2Path=need(path.join(ev,"m4-19d4bm2-controlled-ten-property-canonical-identity-creation-and-dual-store-commit-execution.json"));
const r3Path=need(path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json"));
const canonicalPath=need(path.join(app,"src/production-validation/canonical-property-identity-data.json"));
const runtimePath=need(path.join(app,"public/production-validation-data/canonical-property-identity-data.json"));
const eventPath=need(path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl"));
const inventoryPath=need(path.join(app,"public/explorer/governed-base-inventory.json"));
const out=path.join(ev,"m4-19d4bn-ten-property-runtime-mirror-propagation-and-browser-visibility-preauthorization.json");

const BM2=readJson(bm2Path);
const R3=readJson(r3Path);

if(BM2.state!=="M419D4BM2_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_DUAL_STORE_COMMIT_CERTIFIED_RUNTIME_PROPAGATION_NOT_AUTHORIZED")
 throw new Error("BM2 state mismatch");
if(BM2.status!=="PASSED") throw new Error("BM2 not passed");

const frozen=R3?.executionManifest?.manifest;
const records=frozen?.records;
if(!Array.isArray(records)||records.length!==10) throw new Error("R3 exact ten records unresolved");

const hashes={
 canonical:sha(canonicalPath),
 runtime:sha(runtimePath),
 events:sha(eventPath),
 inventory:sha(inventoryPath)
};

if(hashes.canonical!==BM2.storageBinding?.after?.canonical) throw new Error("canonical drift since BM2");
if(hashes.events!==BM2.storageBinding?.after?.events) throw new Error("creation-event store drift since BM2");
if(hashes.runtime!==BM2.storageBinding?.after?.runtime) throw new Error("runtime mirror drift since BM2");
if(hashes.inventory!==BM2.storageBinding?.after?.inventory) throw new Error("governed inventory drift since BM2");

const canonical=readJson(canonicalPath);
const runtime=readJson(runtimePath);

for(const [name,obj] of [["canonical",canonical],["runtime",runtime]]){
 if(!obj||typeof obj!=="object"||Array.isArray(obj)) throw new Error(name+" store not object");
 for(const k of ["identities","aliasLedger","events"]) if(!Array.isArray(obj[k])) throw new Error(name+" missing "+k);
}

function countBy(store,r){
 return {
  identityCount:store.identities.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId).length,
  aliasCount:store.aliasLedger.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId&&x?.sourcePropertyId===r.sourcePropertyId).length,
  canonicalEventCount:store.events.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED"&&x?.canonicalPropertyId===r.canonicalPropertyId&&x?.sourcePropertyId===r.sourcePropertyId).length
 };
}

const perRecord=records.map((r,i)=>{
 const c=countBy(canonical,r);
 const m=countBy(runtime,r);
 return {
  cohortPosition:r.cohortPosition??i+1,
  canonicalPropertyId:r.canonicalPropertyId,
  sourcePropertyId:r.sourcePropertyId,
  address:r.address,
  canonical:c,
  runtime:m,
  canonicalCommittedExactlyOnce:c.identityCount===1&&c.aliasCount===1&&c.canonicalEventCount===1,
  runtimeAbsent:m.identityCount===0&&m.aliasCount===0&&m.canonicalEventCount===0,
  propagationRequired:true
 };
});

const delta={
 identitiesDelta:canonical.identities.length-runtime.identities.length,
 aliasLedgerDelta:canonical.aliasLedger.length-runtime.aliasLedger.length,
 eventsDelta:canonical.events.length-runtime.events.length
};

const exactTenDelta=
 delta.identitiesDelta===10 &&
 delta.aliasLedgerDelta===10 &&
 delta.eventsDelta===10 &&
 perRecord.every(x=>x.canonicalCommittedExactlyOnce&&x.runtimeAbsent);

const propagationManifest={
 sourceCanonicalStore:{path:canonicalPath,sha256:hashes.canonical},
 targetRuntimeMirror:{path:runtimePath,sha256Before:hashes.runtime},
 externalCreationEventStore:{path:eventPath,sha256:hashes.events},
 governedInventory:{path:inventoryPath,sha256:hashes.inventory},
 cohortHash:BM2.authorization?.cohortHash,
 executionManifestHash:BM2.authorization?.executionManifestHash,
 recordCount:10,
 propagationMode:"CONTROLLED_CANONICAL_TO_RUNTIME_MIRROR_OBJECT_STORE_PARITY",
 expectedPostPropagationRuntimeSha256:hashes.canonical,
 exactTopLevelObjectParityRequired:true,
 exactTenRecords:perRecord.map(x=>({
   cohortPosition:x.cohortPosition,
   canonicalPropertyId:x.canonicalPropertyId,
   sourcePropertyId:x.sourcePropertyId,
   address:x.address
 }))
};
const propagationManifestHash=crypto.createHash("sha256").update(JSON.stringify(propagationManifest)).digest("hex");

const checks={
 bm2Passed:true,
 exactTenFrozen:true,
 canonicalHashMatchesBM2PostCommit:hashes.canonical===BM2.storageBinding.after.canonical,
 eventHashMatchesBM2PostCommit:hashes.events===BM2.storageBinding.after.events,
 runtimeHashMatchesBM2UnpropagatedState:hashes.runtime===BM2.storageBinding.after.runtime,
 inventoryHashStable:hashes.inventory===BM2.storageBinding.after.inventory,
 canonicalRuntimeCurrentlyDiverged:hashes.canonical!==hashes.runtime,
 canonicalAndRuntimeShapesCompatible:
  Object.keys(canonical).sort().join("|")===Object.keys(runtime).sort().join("|"),
 exactTenIdentityDelta:delta.identitiesDelta===10,
 exactTenAliasDelta:delta.aliasLedgerDelta===10,
 exactTenCanonicalEventDelta:delta.eventsDelta===10,
 allTenCanonicalCommittedExactlyOnce:perRecord.every(x=>x.canonicalCommittedExactlyOnce),
 allTenRuntimeAbsent:perRecord.every(x=>x.runtimeAbsent),
 exactTenDeltaCertified:exactTenDelta
};
const passed=Object.values(checks).every(Boolean);

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BN_TEN_PROPERTY_RUNTIME_MIRROR_PROPAGATION_AND_BROWSER_VISIBILITY_PREAUTHORIZATION",
 version:"4.0-m4.19d4bn",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BN_EXACT_TEN_PROPERTY_RUNTIME_MIRROR_DELTA_CERTIFIED_PROPAGATION_AND_BROWSER_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED"
  :"M419D4BN_RUNTIME_MIRROR_PROPAGATION_PREAUTHORIZATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 prerequisite:{
  bm2State:BM2.state,
  cohortHash:BM2.authorization?.cohortHash,
  executionManifestHash:BM2.authorization?.executionManifestHash
 },
 storageBinding:{
  canonicalStore:canonicalPath,
  runtimeMirror:runtimePath,
  creationEventStore:eventPath,
  governedInventory:inventoryPath,
  hashes
 },
 delta,
 cohort:{size:10,perRecord},
 checks,
 propagationPreauthorization:{
  preauthorized:passed,
  executionAuthorized:false,
  maximumRuntimeBindings:10,
  propagationManifest,
  propagationManifestHash,
  targetMustBecomeByteParityWithCanonical:true,
  canonicalStoreImmutableDuringPropagation:true,
  externalCreationEventStoreImmutable:true,
  governedInventoryImmutable:true,
  runtimeMirrorOnlyMutationAllowed:true,
  backupBeforeRuntimeReplaceRequired:true,
  readAfterWriteRequired:true,
  exactPostWriteSha256Required:hashes.canonical,
  noAutomaticRetry:true,
  explicitFreshBN1ExecutionAuthorizationRequired:true
 },
 browserVisibilityPreauthorization:{
  preauthorized:passed,
  browserExecutionAuthorized:false,
  exactSearchControlRequired:true,
  exactTenInteractiveQueriesRequired:true,
  renderedCandidateRequired:true,
  selectionActivationRequired:true,
  postSelectionAddressVisibilityRequired:true,
  screenshotsRequired:true,
  separatePostPropagationBrowserCertificationMilestoneRequired:true
 },
 policy:{
  readOnlyPreauthorization:true,
  runtimePropagationNotExecuted:true,
  browserInteractionNotExecuted:true,
  canonicalMutation:false,
  eventMutation:false,
  inventoryMutation:false,
  temporalMutation:false,
  availabilityMutation:false,
  broadScaleOutAuthorized:false,
  networkRequests:0
 },
 nextMilestone:passed
  ?"M4.19D4BN1_CONTROLLED_TEN_PROPERTY_RUNTIME_MIRROR_PROPAGATION_EXECUTION_AND_PARITY_CERTIFICATION"
  :"M4.19D4BN_R1_RUNTIME_DELTA_RECONCILIATION",
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
  applicationMutationPerformed:false,
  uiMutationPerformed:false,
  automaticRetry:false
 }
};

fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!passed) process.exit(2);
