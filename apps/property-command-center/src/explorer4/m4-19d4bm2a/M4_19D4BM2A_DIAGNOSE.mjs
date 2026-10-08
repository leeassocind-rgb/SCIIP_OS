#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const r3Path=path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const runtimePath=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");
const firstInsertPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
const eventAdapterPath=path.join(app,"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js");
const out=path.join(ev,"m4-19d4bm2a-dual-store-production-adapter-contract-binding-and-execution-readiness.json");

for(const p of [r3Path,canonicalPath,eventPath,runtimePath,inventoryPath,firstInsertPath,eventAdapterPath])
 if(!fs.existsSync(p)) throw new Error("required input missing: "+p);

const R3=JSON.parse(fs.readFileSync(r3Path,"utf8"));
if(R3.state!=="M419D4BM1_R3_TEN_CANONICAL_IDS_DERIVED_DETERMINISTIC_COLLISION_FREE_EXECUTION_MANIFEST_FINALIZED_BM2_EXECUTION_AUTHORIZATION_REQUIRED")
 throw new Error("R3 state mismatch");

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const frozen=R3.executionManifest.manifest;
const hashes={
 canonical:sha(canonicalPath), events:sha(eventPath), runtime:sha(runtimePath), inventory:sha(inventoryPath),
 firstInsertAdapter:sha(firstInsertPath), eventAdapter:sha(eventAdapterPath)
};
const expected={
 canonical:frozen.canonicalStore.sha256, events:frozen.eventStore.sha256,
 runtime:frozen.runtimeMirror.sha256, inventory:frozen.inventory.sha256,
 firstInsertAdapter:frozen.firstInsertAdapter.sha256, eventAdapter:frozen.creationEventAdapter.sha256
};
for(const k of Object.keys(expected)) if(hashes[k]!==expected[k]) throw new Error(`${k} drift since R3`);

async function inspectModule(p, factoryName){
 const m=await import(pathToFileURL(p).href+"?bm2a="+Date.now());
 const exports=Object.keys(m).sort();
 const factory=m[factoryName];
 if(typeof factory!=="function") throw new Error(`missing factory ${factoryName}`);
 const factorySource=Function.prototype.toString.call(factory);
 return {
  exports,
  factoryName,
  factoryType:typeof factory,
  factoryArity:factory.length,
  factoryAsync:factory?.constructor?.name==="AsyncFunction",
  factorySourceSha256:crypto.createHash("sha256").update(factorySource).digest("hex"),
  factorySourcePreview:factorySource.slice(0,1200)
 };
}
const first=await inspectModule(firstInsertPath,"buildGovernedCanonicalFirstInsertProductionStoreAdapter");
const event=await inspectModule(eventAdapterPath,"buildGovernedCanonicalCreationEventStoreAdapter");

const sourceFirst=fs.readFileSync(firstInsertPath,"utf8");
const sourceEvent=fs.readFileSync(eventAdapterPath,"utf8");
const methodTokens=s=>[...new Set([...s.matchAll(/(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g)].map(x=>x[1]))].sort();

const firstMethods=methodTokens(sourceFirst);
const eventMethods=methodTokens(sourceEvent);

const checks={
 r3Passed:R3.status==="PASSED",
 exactTenFrozen:frozen.records?.length===10,
 executionManifestFrozen:R3.executionManifest.frozen===true,
 executionStillUnauthorized:R3.executionManifest.executionAuthorized===false,
 canonicalHashStable:hashes.canonical===expected.canonical,
 eventHashStable:hashes.events===expected.events,
 runtimeHashStable:hashes.runtime===expected.runtime,
 inventoryHashStable:hashes.inventory===expected.inventory,
 firstInsertAdapterHashStable:hashes.firstInsertAdapter===expected.firstInsertAdapter,
 eventAdapterHashStable:hashes.eventAdapter===expected.eventAdapter,
 firstInsertFactoryPresent:first.factoryType==="function",
 eventFactoryPresent:event.factoryType==="function",
 noCommitEnvironmentRequested:process.env.SCIIP_M419D4BM2_COMMIT!=="YES"
};
const passed=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM2A_DUAL_STORE_PRODUCTION_ADAPTER_CONTRACT_BINDING_AND_EXECUTION_READINESS",
 version:"4.0-m4.19d4bm2a",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM2A_DUAL_STORE_ADAPTER_CONTRACTS_BOUND_FROZEN_MANIFEST_STABLE_BM2_COMMIT_IMPLEMENTATION_READY"
  :"M419D4BM2A_EXECUTION_READINESS_BLOCKED",
 certifiedAt:new Date().toISOString(),
 prerequisite:{
  r3State:R3.state,
  cohortHash:frozen.cohortHash,
  executionManifestHash:R3.executionManifest.executionManifestHash
 },
 frozenManifest:{
  cohortSize:frozen.cohortSize,
  maximumCanonicalIdentityCreations:frozen.maximumCanonicalIdentityCreations,
  recordCount:frozen.records.length
 },
 storeParity:{hashes,expected},
 adapterContracts:{
  firstInsert:{...first,sourceMethodTokens:firstMethods},
  creationEvent:{...event,sourceMethodTokens:eventMethods}
 },
 checks,
 policy:{
  diagnosticOnly:true,
  readOnly:true,
  productionExecutionAuthorized:false,
  productionWrites:false,
  adapterInvocation:false,
  factoryInvocation:false,
  networkRequests:0,
  noTemporalMutation:true,
  noAvailabilityMutation:true,
  noGovernedInventoryMutation:true,
  noRuntimePropagation:true,
  broadScaleOutAuthorized:false
 },
 nextMilestone:passed
  ?"M4.19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION"
  :"M4.19D4BM2A_R1_ADAPTER_CONTRACT_RECONCILIATION",
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
