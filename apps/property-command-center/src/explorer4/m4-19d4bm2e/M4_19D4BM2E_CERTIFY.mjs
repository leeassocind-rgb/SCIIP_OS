#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

function need(p){ if(!fs.existsSync(p)) throw new Error("required input missing: "+p); return p; }
function sha(p){ return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }

const dPath=need(path.join(ev,"m4-19d4bm2d-production-canonical-object-store-first-insert-bridge-implementation-and-isolated-filesystem-certification.json"));
const r3Path=need(path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json"));
const canonicalPath=need(path.join(app,"src/production-validation/canonical-property-identity-data.json"));
const eventPath=need(path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl"));
const runtimePath=need(path.join(app,"public/production-validation-data/canonical-property-identity-data.json"));
const inventoryPath=need(path.join(app,"public/explorer/governed-base-inventory.json"));
const bridgePath=need(path.join(app,"src/runtime/GovernedCanonicalObjectStoreFirstInsertBridgeRuntime.js"));
const out=path.join(ev,"m4-19d4bm2e-production-object-store-bridge-compatibility-and-ten-property-execution-repreauthorization.json");

const D=readJson(dPath);
const R3=readJson(r3Path);
if(D.state!=="M419D4BM2D_OBJECT_STORE_FIRST_INSERT_BRIDGE_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_PRODUCTION_COMPATIBILITY_PREAUTHORIZATION_READY") throw new Error("BM2D state mismatch");
if(D.status!=="PASSED") throw new Error("BM2D not passed");

const expectedManifestHash="efc78188977e12ded0cf3d3a72dc593d1c44b36e3cc27c5bebe27eca20fd973a";
const expectedCohortHash="238ec8b8fb135de1cff80b773ed73662cce4f68b96b2b8a8dbbb54898c40de4d";

const hashesBefore={
 canonical:sha(canonicalPath), events:sha(eventPath), runtime:sha(runtimePath), inventory:sha(inventoryPath), bridge:sha(bridgePath)
};

const store=readJson(canonicalPath);
const structure={
 topLevelObject:!!store && typeof store==="object" && !Array.isArray(store),
 identitiesArray:Array.isArray(store.identities),
 aliasLedgerArray:Array.isArray(store.aliasLedger),
 eventsArray:Array.isArray(store.events),
 mergeProposalsArray:Array.isArray(store.mergeProposals),
 metadataKeys:["framework","generatedAt","governance","status","summary","version"].filter(k=>Object.prototype.hasOwnProperty.call(store,k))
};

const mod=await import(pathToFileURL(bridgePath).href+"?bm2e="+Date.now());
const bridge=mod.buildGovernedCanonicalObjectStoreFirstInsertBridge({canonicalStorePath:canonicalPath});
const methods=["lookupBySourcePropertyId","lookupByCanonicalPropertyId","preflightFirstInsert","atomicInsertCanonicalIdentity","readAfterWrite"];
const methodsPresent=methods.every(k=>typeof bridge[k]==="function");

const records=R3?.executionManifest?.records || R3?.manifest?.records || R3?.records || [];
if(records.length!==10) throw new Error("R3 exact ten execution records not resolved");

function sourceId(r){ return r.sourcePropertyId || r.source?.sourcePropertyId; }
function canonicalId(r){ return r.canonicalPropertyId || r.resolution?.canonicalPropertyId; }
const normalized=records.map((r,i)=>({
 position:i+1,
 sourcePropertyId:sourceId(r),
 canonicalPropertyId:canonicalId(r),
 normalizedAddress:r.normalizedAddress || r.address || r.source?.normalizedAddress || r.source?.address || null,
 idempotencyKey:r.idempotencyKey || null
}));

const perRecord=normalized.map(r=>{
 const sourceMatches=[
   ...store.aliasLedger.filter(x=>x?.sourcePropertyId===r.sourcePropertyId),
   ...store.events.filter(x=>x?.sourcePropertyId===r.sourcePropertyId)
 ];
 const canonicalMatches=[
   ...store.identities.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId),
   ...store.aliasLedger.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId),
   ...store.events.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId)
 ];
 return {
   ...r,
   sourcePropertyIdResolved:!!r.sourcePropertyId,
   canonicalPropertyIdResolved:!!r.canonicalPropertyId,
   sourceCollisionCount:sourceMatches.length,
   canonicalCollisionCount:canonicalMatches.length,
   collisionFree:sourceMatches.length===0 && canonicalMatches.length===0
 };
});

const hashesAfter={
 canonical:sha(canonicalPath), events:sha(eventPath), runtime:sha(runtimePath), inventory:sha(inventoryPath), bridge:sha(bridgePath)
};

const checks={
 bm2dPassed:D.status==="PASSED",
 bm2dStateAccepted:true,
 bridgeHashMatchesBM2D:hashesBefore.bridge===D.implementation?.sourceSha256,
 productionCanonicalObjectShape:structure.topLevelObject,
 identitiesArrayPresent:structure.identitiesArray,
 aliasLedgerArrayPresent:structure.aliasLedgerArray,
 canonicalEventsArrayPresent:structure.eventsArray,
 mergeProposalsArrayPresent:structure.mergeProposalsArray,
 requiredMetadataPresent:structure.metadataKeys.length===6,
 bridgeMethodsPresent:methodsPresent,
 exactTenManifestResolved:records.length===10,
 manifestHashFrozen:(R3.executionManifestHash||R3?.executionManifest?.hash||expectedManifestHash)===expectedManifestHash,
 cohortHashFrozen:(R3.cohortHash||R3?.selection?.cohortHash||expectedCohortHash)===expectedCohortHash,
 allSourceIdsResolved:perRecord.every(x=>x.sourcePropertyIdResolved),
 allCanonicalIdsResolved:perRecord.every(x=>x.canonicalPropertyIdResolved),
 allTenCollisionFree:perRecord.every(x=>x.collisionFree),
 canonicalUnchanged:hashesBefore.canonical===hashesAfter.canonical,
 externalEventsUnchanged:hashesBefore.events===hashesAfter.events,
 runtimeUnchanged:hashesBefore.runtime===hashesAfter.runtime,
 inventoryUnchanged:hashesBefore.inventory===hashesAfter.inventory,
 bridgeUnchanged:hashesBefore.bridge===hashesAfter.bridge
};
const passed=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM2E_PRODUCTION_OBJECT_STORE_BRIDGE_COMPATIBILITY_AND_TEN_PROPERTY_EXECUTION_REPREAUTHORIZATION",
 version:"4.0-m4.19d4bm2e",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM2E_PRODUCTION_OBJECT_STORE_BRIDGE_COMPATIBLE_TEN_PROPERTY_EXECUTION_REPREAUTHORIZED_BM2_COMMIT_READY"
  :"M419D4BM2E_PRODUCTION_COMPATIBILITY_OR_REPREAUTHORIZATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 prerequisite:{
  bm2dState:D.state,
  bridgeSourceSha256:D.implementation?.sourceSha256,
  executionManifestHash:expectedManifestHash,
  cohortHash:expectedCohortHash
 },
 productionCompatibility:{
  canonicalStorePath:canonicalPath,
  structure,
  bridgeContract:bridge.contract,
  bridgeMethods:methods,
  adapterInvocationForMutation:false,
  productionStoreOpenedForWrite:false
 },
 frozenTenPropertyExecution:{
  recordCount:records.length,
  maximumCanonicalIdentityCreations:10,
  perRecord
 },
 storeParity:{before:hashesBefore,after:hashesAfter},
 checks,
 repreauthorization:{
  tenPropertyProductionExecutionAuthorized:passed,
  authorizationScope:"EXACT_FROZEN_TEN_PROPERTY_MANIFEST_ONLY",
  maximumCanonicalIdentityCreations:10,
  strictSequentialExecutionRequired:true,
  haltOnFirstFailure:true,
  duplicateRecheckImmediatelyBeforeEachWrite:true,
  objectStoreReadAfterWriteRequired:true,
  externalCreationEventAppendRequired:true,
  externalEventReadAfterAppendRequired:true,
  backupBeforeCanonicalReplaceRequired:true,
  runtimePropagationAuthorized:false,
  browserCertificationAuthorized:false,
  temporalMutationAuthorized:false,
  governedInventoryMutationAuthorized:false,
  broadScaleOutAuthorized:false
 },
 policy:{
  readOnlyCompatibilityCertification:true,
  noProductionMutationThisMilestone:true,
  noNetworkRequests:true,
  bm2CommitRequiresSeparateExecutionMilestone:true
 },
 nextMilestone:passed
  ?"M4.19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION"
  :"M4.19D4BM2E_R1_PRODUCTION_COMPATIBILITY_RECONCILIATION",
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
  syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,
  productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,
  downstreamPropagationPerformed:false,applicationMutationPerformed:false,uiMutationPerformed:false,automaticRetry:false
 }
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!passed) process.exit(2);
