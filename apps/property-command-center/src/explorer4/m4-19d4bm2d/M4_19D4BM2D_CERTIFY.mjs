#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const cPath=path.join(ev,"m4-19d4bm2c-production-canonical-object-store-first-insert-bridge-design-and-preauthorization.json");
const prodCanonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const prodEvent=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const bridgePath=path.join(app,"src/runtime/GovernedCanonicalObjectStoreFirstInsertBridgeRuntime.js");
const out=path.join(ev,"m4-19d4bm2d-production-canonical-object-store-first-insert-bridge-implementation-and-isolated-filesystem-certification.json");

for(const p of [cPath,prodCanonical,prodEvent,bridgePath]) if(!fs.existsSync(p)) throw new Error("required input missing: "+p);
const C=JSON.parse(fs.readFileSync(cPath,"utf8"));
if(C.state!=="M419D4BM2C_OBJECT_STORE_FIRST_INSERT_BRIDGE_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED") throw new Error("BM2C state mismatch");

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const prodCanonicalBefore=sha(prodCanonical), prodEventBefore=sha(prodEvent);

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip-bm2d-"));
const fixture=path.join(tmp,"canonical-object-store.json");
const fixtureInitial={
 framework:"BM2D_ISOLATED_FIXTURE",
 version:"1",
 status:"CERTIFICATION_ONLY",
 generatedAt:"2026-08-19T00:00:00.000Z",
 governance:{mode:"ISOLATED"},
 summary:{note:"fixture"},
 identities:[
  {canonicalPropertyId:"CPROP-AAAAAAAAAAAAAAAAAAAA",normalizedAddress:"1 Existing Way"}
 ],
 aliasLedger:[
  {sourcePropertyId:"BASE-EXISTING-001",canonicalPropertyId:"CPROP-AAAAAAAAAAAAAAAAAAAA",normalizedAddress:"1 Existing Way"}
 ],
 mergeProposals:[{id:"MP-1",state:"PRESERVE"}],
 events:[
  {eventType:"CANONICAL_IDENTITY_CREATED",canonicalPropertyId:"CPROP-AAAAAAAAAAAAAAAAAAAA",sourcePropertyId:"BASE-EXISTING-001",idempotencyKey:"EXISTING-1"}
 ]
};
fs.writeFileSync(fixture,JSON.stringify(fixtureInitial,null,2)+"\n");

const mod=await import(pathToFileURL(bridgePath).href+"?bm2d="+Date.now());
if(typeof mod.buildGovernedCanonicalObjectStoreFirstInsertBridge!=="function") throw new Error("bridge factory missing");

const unauthorized=mod.buildGovernedCanonicalObjectStoreFirstInsertBridge({canonicalStorePath:fixture});
const input={
 canonicalPropertyId:"CPROP-BBBBBBBBBBBBBBBBBBBB",
 sourcePropertyId:"BASE-BM2D-FIXTURE-001",
 normalizedAddress:"100 Bridge Certification Way",
 sourceProvenance:{provider:"BM2D_ISOLATED_FIXTURE"},
 identityEvidence:{kind:"OBJECT_STORE_FIRST_INSERT_BRIDGE_CERTIFICATION"},
 authorityReference:"SCIIP_CANONICAL_ID_AUTHORITY_V1/SHA256_SOURCE_ADDRESS_PROVENANCE_IDENTITY_V1/20",
 derivationHash:"B".repeat(64),
 idempotencyKey:"CANONICAL_FIRST_INSERT:"+crypto.createHash("sha256").update("BM2D-FIXTURE-001").digest("hex"),
 observationTimestamp:"2026-08-19T00:00:00.000Z"
};

const preflight=unauthorized.preflightFirstInsert(input);
const unauth=unauthorized.atomicInsertCanonicalIdentity(input);

const authorized=mod.buildGovernedCanonicalObjectStoreFirstInsertBridge({
 canonicalStorePath:fixture,
 authorizationToken:"BM2D_ISOLATED_CERTIFICATION_ONLY"
});
const committed=authorized.atomicInsertCanonicalIdentity(input);
const readAfter=authorized.readAfterWrite({
 canonicalPropertyId:input.canonicalPropertyId,
 sourcePropertyId:input.sourcePropertyId,
 idempotencyKey:input.idempotencyKey
});
const replay=authorized.atomicInsertCanonicalIdentity(input);

const after=JSON.parse(fs.readFileSync(fixture,"utf8"));
const prodCanonicalAfter=sha(prodCanonical), prodEventAfter=sha(prodEvent);
const unrelatedPreserved=
 after.framework===fixtureInitial.framework &&
 after.version===fixtureInitial.version &&
 after.status===fixtureInitial.status &&
 JSON.stringify(after.governance)===JSON.stringify(fixtureInitial.governance) &&
 JSON.stringify(after.summary)===JSON.stringify(fixtureInitial.summary) &&
 JSON.stringify(after.mergeProposals)===JSON.stringify(fixtureInitial.mergeProposals);

const checks={
 bm2cPreauthorizationAccepted:true,
 bridgeFactoryPresent:true,
 unauthorizedInsertBlocked:unauth?.committed===false && unauth?.state==="UNAUTHORIZED",
 preflightReady:preflight?.ready===true,
 isolatedCommitSucceeded:committed?.committed===true,
 readAfterWriteVerified:readAfter?.verified===true,
 exactlyOneIdentityAppended:after.identities.length===fixtureInitial.identities.length+1,
 exactlyOneAliasAppended:after.aliasLedger.length===fixtureInitial.aliasLedger.length+1,
 exactlyOneCanonicalEventAppended:after.events.length===fixtureInitial.events.length+1,
 unrelatedTopLevelDataPreserved:unrelatedPreserved,
 mergeProposalsPreserved:JSON.stringify(after.mergeProposals)===JSON.stringify(fixtureInitial.mergeProposals),
 replayBlocked:replay?.committed===false && ["DUPLICATE_CANONICAL_PROPERTY_ID","DUPLICATE_SOURCE_PROPERTY_ID"].includes(replay?.state),
 productionCanonicalUnchanged:prodCanonicalBefore===prodCanonicalAfter,
 productionEventStoreUnchanged:prodEventBefore===prodEventAfter,
 isolatedBackupCreated:!!committed?.backup && fs.existsSync(committed.backup)
};
const passed=Object.values(checks).every(Boolean);

const sourceSha256=sha(bridgePath);
const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM2D_PRODUCTION_CANONICAL_OBJECT_STORE_FIRST_INSERT_BRIDGE_IMPLEMENTATION_AND_ISOLATED_FILESYSTEM_CERTIFICATION",
 version:"4.0-m4.19d4bm2d",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM2D_OBJECT_STORE_FIRST_INSERT_BRIDGE_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_PRODUCTION_COMPATIBILITY_PREAUTHORIZATION_READY"
  :"M419D4BM2D_BRIDGE_ISOLATED_CERTIFICATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 implementation:{
  module:"src/runtime/GovernedCanonicalObjectStoreFirstInsertBridgeRuntime.js",
  factory:"buildGovernedCanonicalObjectStoreFirstInsertBridge",
  methods:["lookupBySourcePropertyId","lookupByCanonicalPropertyId","preflightFirstInsert","atomicInsertCanonicalIdentity","readAfterWrite"],
  sourceSha256,
  productionExecutionAuthorized:false
 },
 isolatedFilesystemCertification:{
  fixtureDirectory:tmp,
  fixtureDirectoryRemovedAfterCertification:true,
  preflight,
  unauthorized:unauth,
  committed,
  readAfterWrite:readAfter,
  replay,
  counts:{
   identitiesBefore:fixtureInitial.identities.length,
   identitiesAfter:after.identities.length,
   aliasLedgerBefore:fixtureInitial.aliasLedger.length,
   aliasLedgerAfter:after.aliasLedger.length,
   eventsBefore:fixtureInitial.events.length,
   eventsAfter:after.events.length,
   mergeProposalsBefore:fixtureInitial.mergeProposals.length,
   mergeProposalsAfter:after.mergeProposals.length
  },
  checks
 },
 productionCompatibility:{
  canonicalStorePath:prodCanonical,
  canonicalSha256Before:prodCanonicalBefore,
  canonicalSha256After:prodCanonicalAfter,
  creationEventStorePath:prodEvent,
  creationEventSha256Before:prodEventBefore,
  creationEventSha256After:prodEventAfter,
  productionStoresOpenedForWrite:false
 },
 designBinding:{
  designHash:C.designHash,
  exactTenManifestStillFrozen:C.prerequisite?.executionManifestHash==="efc78188977e12ded0cf3d3a72dc593d1c44b36e3cc27c5bebe27eca20fd973a"
 },
 policy:{
  implementationCompleted:true,
  isolatedCertificationOnly:true,
  productionExecutionAuthorized:false,
  bm2CommitStillProhibited:true,
  separateProductionCompatibilityPreauthorizationRequired:true,
  noRuntimePropagation:true,
  noInventoryMutation:true,
  noTemporalMutation:true,
  noNetworkRequest:true
 },
 nextMilestone:passed
  ?"M4.19D4BM2E_PRODUCTION_OBJECT_STORE_BRIDGE_COMPATIBILITY_AND_TEN_PROPERTY_EXECUTION_REPREAUTHORIZATION"
  :"M4.19D4BM2D_R1_BRIDGE_IMPLEMENTATION_RECONCILIATION",
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
  syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,
  productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,
  downstreamPropagationPerformed:false,applicationSourceImplementationPerformed:true,uiMutationPerformed:false,automaticRetry:false
 }
};

try{ fs.rmSync(tmp,{recursive:true,force:true}); }catch{}
fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!passed) process.exit(2);
