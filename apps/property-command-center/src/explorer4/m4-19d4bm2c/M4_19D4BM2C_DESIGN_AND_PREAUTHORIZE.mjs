#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bPath=path.join(ev,"m4-19d4bm2b-production-canonical-store-shape-compatibility-and-first-insert-binding-adjudication.json");
const r3Path=path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const bridgePath=path.join(app,"src/runtime/GovernedCanonicalObjectStoreFirstInsertBridgeRuntime.js");
const out=path.join(ev,"m4-19d4bm2c-production-canonical-object-store-first-insert-bridge-design-and-preauthorization.json");

for(const p of [bPath,r3Path,canonicalPath,eventPath]) if(!fs.existsSync(p)) throw new Error("required input missing: "+p);

const B=JSON.parse(fs.readFileSync(bPath,"utf8"));
const R3=JSON.parse(fs.readFileSync(r3Path,"utf8"));

if(B.state!=="M419D4BM2B_PRODUCTION_CANONICAL_STORE_OBJECT_SHAPE_INCOMPATIBLE_WITH_ARRAY_ONLY_FIRST_INSERT_ADAPTER_BRIDGE_IMPLEMENTATION_PREAUTHORIZATION_READY")
 throw new Error("BM2B state mismatch");
if(R3.state!=="M419D4BM1_R3_TEN_CANONICAL_IDS_DERIVED_DETERMINISTIC_COLLISION_FREE_EXECUTION_MANIFEST_FINALIZED_BM2_EXECUTION_AUTHORIZATION_REQUIRED")
 throw new Error("R3 state mismatch");

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const canonicalSha=sha(canonicalPath), eventSha=sha(eventPath);
if(canonicalSha!==R3.executionManifest.manifest.canonicalStore.sha256) throw new Error("canonical drift since R3");
if(eventSha!==R3.executionManifest.manifest.eventStore.sha256) throw new Error("event drift since R3");

const rootObj=JSON.parse(fs.readFileSync(canonicalPath,"utf8"));
if(Array.isArray(rootObj)||!rootObj||typeof rootObj!=="object") throw new Error("authoritative canonical store not structured object");
for(const k of ["identities","aliasLedger","events"]) if(!Array.isArray(rootObj[k])) throw new Error("required canonical array missing: "+k);

const structural={
 topLevelType:"OBJECT",
 identities:{length:rootObj.identities.length},
 aliasLedger:{length:rootObj.aliasLedger.length},
 events:{length:rootObj.events.length},
 mergeProposals:{length:Array.isArray(rootObj.mergeProposals)?rootObj.mergeProposals.length:null},
 requiredMetadataKeys:["framework","generatedAt","governance","status","summary","version"].filter(k=>k in rootObj)
};

const design={
 capability:"GOVERNED_CANONICAL_OBJECT_STORE_FIRST_INSERT_BRIDGE",
 purpose:"Apply a governed first canonical identity insert to the authoritative structured canonical object store without repurposing the array-only adapter.",
 proposedModule:"src/runtime/GovernedCanonicalObjectStoreFirstInsertBridgeRuntime.js",
 proposedFactory:"buildGovernedCanonicalObjectStoreFirstInsertBridge",
 methods:[
  "lookupBySourcePropertyId",
  "lookupByCanonicalPropertyId",
  "preflightFirstInsert",
  "atomicInsertCanonicalIdentity",
  "readAfterWrite"
 ],
 inputContract:[
  "canonicalStorePath",
  "authorizationToken",
  "canonicalPropertyId",
  "sourcePropertyId",
  "normalizedAddress",
  "sourceProvenance",
  "identityEvidence",
  "authorityReference",
  "derivationHash",
  "idempotencyKey",
  "observationTimestamp"
 ],
 mutationContract:{
  topLevelObjectPreserved:true,
  identitiesAppendExactlyOne:true,
  aliasLedgerAppendExactlyOne:true,
  canonicalEventsAppendExactlyOne:true,
  mergeProposalsUnchanged:true,
  unrelatedTopLevelKeysPreserved:true,
  atomicWholeObjectReplace:true,
  backupBeforeReplace:true,
  readAfterWriteRequired:true,
  sourceAndCanonicalDuplicateRecheckImmediatelyBeforeWrite:true,
  deterministicIdempotencyRequired:true,
  sequentialExecutionOnly:true,
  haltOnFirstFailure:true
 },
 recordSemantics:{
  identities:"append canonical identity record keyed by canonicalPropertyId",
  aliasLedger:"append sourcePropertyId -> canonicalPropertyId binding",
  events:"append canonical identity creation event consistent with existing canonical event semantics",
  externalCreationEventStore:"remains separately governed by existing JSONL creation-event adapter"
 },
 prohibitions:{
  rewriteExistingCanonicalIds:true,
  deleteExistingRecords:true,
  mutateGovernedInventory:true,
  mutateTemporalObservations:true,
  mutateAvailability:true,
  propagateRuntimeMirror:true,
  networkRequests:true,
  invokeBM2ProductionCommit:true
 }
};

const designHash=crypto.createHash("sha256").update(JSON.stringify(design)).digest("hex");

const checks={
 bm2bGapCertified:B.adjudication?.productionShapeCapabilityGapCertified===true,
 canonicalHashStable:canonicalSha===R3.executionManifest.manifest.canonicalStore.sha256,
 eventHashStable:eventSha===R3.executionManifest.manifest.eventStore.sha256,
 canonicalStoreObject:true,
 identitiesArrayPresent:Array.isArray(rootObj.identities),
 aliasLedgerArrayPresent:Array.isArray(rootObj.aliasLedger),
 eventsArrayPresent:Array.isArray(rootObj.events),
 exactTenManifestStillFrozen:R3.executionManifest?.manifest?.records?.length===10,
 noExistingBridgeImplementation:!fs.existsSync(bridgePath)
};
const passed=Object.values(checks).every(Boolean);

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM2C_PRODUCTION_CANONICAL_OBJECT_STORE_FIRST_INSERT_BRIDGE_DESIGN_AND_PREAUTHORIZATION",
 version:"4.0-m4.19d4bm2c",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM2C_OBJECT_STORE_FIRST_INSERT_BRIDGE_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED"
  :"M419D4BM2C_BRIDGE_DESIGN_PREAUTHORIZATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 prerequisite:{
  bm2bState:B.state,
  executionManifestHash:R3.executionManifest.executionManifestHash,
  cohortHash:R3.cohort.cohortHash
 },
 structuralBinding:structural,
 design,
 designHash,
 checks,
 implementationPreauthorization:{
  implementationAuthorizedNextMilestone:passed,
  productionExecutionAuthorized:false,
  isolatedFilesystemCertificationRequired:true,
  productionCompatibilityReadOnlyCertificationRequired:true,
  exactTenProductionExecutionStillProhibited:true
 },
 policy:{
  designOnly:true,
  implementationNotExecuted:true,
  bm2ExecutionNotAuthorized:true,
  noProductionCanonicalWrite:true,
  noProductionEventWrite:true,
  noRuntimePropagation:true,
  noInventoryMutation:true,
  noTemporalMutation:true,
  noNetworkRequest:true
 },
 nextMilestone:passed
  ?"M4.19D4BM2D_PRODUCTION_CANONICAL_OBJECT_STORE_FIRST_INSERT_BRIDGE_IMPLEMENTATION_AND_ISOLATED_FILESYSTEM_CERTIFICATION"
  :"M4.19D4BM2C_R1_BRIDGE_DESIGN_RECONCILIATION",
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
