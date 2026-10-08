#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bmPath=path.join(ev,"m4-19d4bm-next-controlled-ten-property-cohort-readiness-and-selection.json");
const r2aPath=path.join(ev,"m4-19d4bm1-r2a-async-authority-contract-reconciliation.json");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const runtimePath=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");
const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const firstInsertPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
const eventAdapterPath=path.join(app,"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js");
const out=path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json");

for(const p of [bmPath,r2aPath,canonicalPath,eventPath,runtimePath,inventoryPath,authorityPath,firstInsertPath,eventAdapterPath])
 if(!fs.existsSync(p)) throw new Error("required input missing: "+p);

const BM=JSON.parse(fs.readFileSync(bmPath,"utf8"));
const R2A=JSON.parse(fs.readFileSync(r2aPath,"utf8"));

if(BM.state!=="M419D4BM_NEXT_CONTROLLED_TEN_PROPERTY_COHORT_DETERMINISTICALLY_SELECTED_CREATION_PREAUTHORIZATION_READY")
 throw new Error("BM state mismatch");
if(R2A.state!=="M419D4BM1_R2A_ASYNC_CANONICAL_ID_AUTHORITY_CONTRACT_RECONCILED_TEN_PROPERTY_DERIVATION_READY")
 throw new Error("BM1-R2A state mismatch");

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const hashes={
 inventory:sha(inventoryPath),
 canonical:sha(canonicalPath),
 events:sha(eventPath),
 runtime:sha(runtimePath),
 authority:sha(authorityPath),
 firstInsertAdapter:sha(firstInsertPath),
 eventAdapter:sha(eventAdapterPath)
};

if(hashes.inventory!==BM.sourceBinding.hashes.inventory) throw new Error("inventory drift since BM");
if(hashes.canonical!==BM.sourceBinding.hashes.canonical) throw new Error("canonical drift since BM");
if(hashes.events!==BM.sourceBinding.hashes.events) throw new Error("event drift since BM");
if(hashes.runtime!==BM.sourceBinding.hashes.runtime) throw new Error("runtime drift since BM");

function collect(x,out=[]){
 if(Array.isArray(x)){ for(const v of x) collect(v,out); }
 else if(x&&typeof x==="object"){ out.push(x); for(const v of Object.values(x)) if(v&&typeof v==="object") collect(v,out); }
 return out;
}
const canonicalObjects=collect(JSON.parse(fs.readFileSync(canonicalPath,"utf8")));
const existingCanonicalIds=[...new Set(canonicalObjects.map(x=>x?.canonicalPropertyId).filter(x=>typeof x==="string"&&/^CPROP-[0-9A-F]{20}$/.test(x)))];
const existingCanonicalSet=new Set(existingCanonicalIds);
const existingSourceSet=new Set(canonicalObjects.map(x=>x?.sourcePropertyId).filter(Boolean));
const existingAddressSet=new Set(canonicalObjects.map(x=>String(x?.normalizedAddress||x?.address||"").trim().toLowerCase()).filter(Boolean));

const events=fs.readFileSync(eventPath,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const eventCanonicalSet=new Set(events.map(x=>x?.canonicalPropertyId).filter(Boolean));
const eventSourceSet=new Set(events.map(x=>x?.sourcePropertyId).filter(Boolean));

const mod=await import(pathToFileURL(authorityPath).href+"?bm1r3="+Date.now());
if(typeof mod.buildGovernedProductionCanonicalIdAuthority!=="function") throw new Error("authority factory missing");
const authority=mod.buildGovernedProductionCanonicalIdAuthority({existingCanonicalIds});
const ns=authority.inspectNamespace();
if(!ns.namespaceHomogeneous||ns.dominantHexPrefixLength!==20) throw new Error("namespace not certified");

const records=[];
for(const r of [...BM.selection.cohort].sort((a,b)=>a.cohortPosition-b.cohortPosition)){
 const sourceProvenance={
  provider:"GOVERNED_BASE_INVENTORY",
  inventorySha256:hashes.inventory,
  inventoryRecordIndex:r.originalIndex,
  cohort:"M4.19D4BM",
  cohortHash:BM.selection.cohortHash
 };
 const identityEvidence={
  address:r.address,
  city:r.city,
  state:r.state,
  buildingSf:r.buildingSf,
  status:r.status,
  sourcePropertyId:r.sourcePropertyId
 };
 const input={
  sourcePropertyId:r.sourcePropertyId,
  normalizedAddress:r.address,
  sourceProvenance,
  identityEvidence
 };

 const a=await authority.resolveCanonicalPropertyId(input);
 const b=await authority.resolveCanonicalPropertyId(input);

 if(!a?.canonicalPropertyId || !/^CPROP-[0-9A-F]{20}$/.test(a.canonicalPropertyId))
  throw new Error("invalid canonical ID for "+r.sourcePropertyId);

 const deterministicRepeat=
  a.canonicalPropertyId===b.canonicalPropertyId &&
  a.derivationHash===b.derivationHash &&
  a.authorityReference===b.authorityReference;

 const idempotencyKey="CANONICAL_FIRST_INSERT:"+crypto.createHash("sha256")
  .update(`${a.canonicalPropertyId}|${r.sourcePropertyId}|${a.derivationHash}`)
  .digest("hex");

 const preauthorizationInputHash=crypto.createHash("sha256").update(JSON.stringify({
  cohortPosition:r.cohortPosition,
  sourcePropertyId:r.sourcePropertyId,
  normalizedAddress:r.address,
  sourceProvenance,
  identityEvidence,
  canonicalPropertyId:a.canonicalPropertyId,
  authorityReference:a.authorityReference,
  derivationHash:a.derivationHash,
  idempotencyKey
 })).digest("hex");

 records.push({
  cohortPosition:r.cohortPosition,
  sourcePropertyId:r.sourcePropertyId,
  address:r.address,
  city:r.city,
  state:r.state,
  buildingSf:r.buildingSf,
  status:r.status,
  canonicalPropertyId:a.canonicalPropertyId,
  resolutionState:a.resolutionState,
  authorityVersion:a.authorityVersion,
  derivationVersion:a.derivationVersion,
  derivationHash:a.derivationHash,
  authorityReference:a.authorityReference,
  namespacePrefixLength:a.namespacePrefixLength,
  deterministicRepeat,
  collisionExisting:existingCanonicalSet.has(a.canonicalPropertyId),
  duplicateSourceExisting:existingSourceSet.has(r.sourcePropertyId),
  duplicateAddressExisting:existingAddressSet.has(r.address.trim().toLowerCase()),
  priorCreationEventByCanonical:eventCanonicalSet.has(a.canonicalPropertyId),
  priorCreationEventBySource:eventSourceSet.has(r.sourcePropertyId),
  sourceProvenance,
  identityEvidence,
  idempotencyKey,
  preauthorizationInputHash,
  executionAuthorized:false
 });
}

const ids=records.map(x=>x.canonicalPropertyId);
const keys=records.map(x=>x.idempotencyKey);
const checks={
 r2aContractCertified:true,
 exactTenDerived:records.length===10,
 cohortHashStable:BM.selection.cohortHash==="238ec8b8fb135de1cff80b773ed73662cce4f68b96b2b8a8dbbb54898c40de4d",
 inventoryHashStable:hashes.inventory===BM.sourceBinding.hashes.inventory,
 canonicalHashStable:hashes.canonical===BM.sourceBinding.hashes.canonical,
 eventHashStable:hashes.events===BM.sourceBinding.hashes.events,
 runtimeHashStable:hashes.runtime===BM.sourceBinding.hashes.runtime,
 canonicalRuntimeParity:hashes.canonical===hashes.runtime,
 namespaceHomogeneous:ns.namespaceHomogeneous===true,
 namespaceTwentyHex:ns.dominantHexPrefixLength===20,
 allIdsTwentyHex:records.every(x=>/^CPROP-[0-9A-F]{20}$/.test(x.canonicalPropertyId)),
 allResolutionStatesAvailable:records.every(x=>x.resolutionState==="DERIVED_CANONICAL_ID_AVAILABLE"),
 allDeterministicRepeat:records.every(x=>x.deterministicRepeat),
 idsUniqueWithinCohort:new Set(ids).size===10,
 idempotencyKeysUnique:new Set(keys).size===10,
 noExistingCanonicalCollisions:records.every(x=>!x.collisionExisting),
 noDuplicateExistingSources:records.every(x=>!x.duplicateSourceExisting),
 noDuplicateExistingAddresses:records.every(x=>!x.duplicateAddressExisting),
 noPriorCreationEventsByCanonical:records.every(x=>!x.priorCreationEventByCanonical),
 noPriorCreationEventsBySource:records.every(x=>!x.priorCreationEventBySource),
 authorityRuntimePresent:true,
 firstInsertAdapterPresent:true,
 eventAdapterPresent:true
};
const passed=Object.values(checks).every(Boolean);

const frozenExecutionManifest={
 cohortHash:BM.selection.cohortHash,
 cohortSize:10,
 maximumCanonicalIdentityCreations:10,
 namespace:ns,
 canonicalStore:{path:canonicalPath,sha256:hashes.canonical},
 eventStore:{path:eventPath,sha256:hashes.events},
 runtimeMirror:{path:runtimePath,sha256:hashes.runtime},
 inventory:{path:inventoryPath,sha256:hashes.inventory},
 canonicalIdAuthority:{
  path:authorityPath,sha256:hashes.authority,
  factory:"buildGovernedProductionCanonicalIdAuthority",
  method:"resolveCanonicalPropertyId",
  invocation:"await authority.resolveCanonicalPropertyId({sourcePropertyId,normalizedAddress,sourceProvenance,identityEvidence})"
 },
 firstInsertAdapter:{
  path:firstInsertPath,sha256:hashes.firstInsertAdapter,
  factory:"buildGovernedCanonicalFirstInsertProductionStoreAdapter"
 },
 creationEventAdapter:{
  path:eventAdapterPath,sha256:hashes.eventAdapter,
  factory:"buildGovernedCanonicalCreationEventStoreAdapter"
 },
 records:records.map(x=>({
  cohortPosition:x.cohortPosition,
  sourcePropertyId:x.sourcePropertyId,
  address:x.address,
  canonicalPropertyId:x.canonicalPropertyId,
  derivationHash:x.derivationHash,
  authorityReference:x.authorityReference,
  idempotencyKey:x.idempotencyKey,
  preauthorizationInputHash:x.preauthorizationInputHash
 }))
};
const executionManifestHash=crypto.createHash("sha256").update(JSON.stringify(frozenExecutionManifest)).digest("hex");

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM1_R3_TEN_PROPERTY_CANONICAL_ID_DERIVATION_AND_EXECUTION_MANIFEST_FINALIZATION",
 version:"4.0-m4.19d4bm1-r3",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM1_R3_TEN_CANONICAL_IDS_DERIVED_DETERMINISTIC_COLLISION_FREE_EXECUTION_MANIFEST_FINALIZED_BM2_EXECUTION_AUTHORIZATION_REQUIRED"
  :"M419D4BM1_R3_TEN_PROPERTY_EXECUTION_MANIFEST_FINALIZATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 prerequisite:{
  bmState:BM.state,
  r2aState:R2A.state
 },
 namespaceCertification:ns,
 cohort:{
  size:10,
  cohortHash:BM.selection.cohortHash,
  records
 },
 checks,
 executionManifest:{
  frozen:true,
  executionAuthorized:false,
  executionManifestHash,
  manifest:frozenExecutionManifest
 },
 policy:{
  readOnlyFinalization:true,
  maximumCanonicalIdentityCreations:10,
  strictSequentialExecutionRequired:true,
  haltOnFirstFailure:true,
  duplicateRecheckImmediatelyBeforeEachInsert:true,
  canonicalReadAfterWriteRequired:true,
  eventAppendAfterCanonicalCommitRequired:true,
  eventReadAfterAppendRequired:true,
  rollbackOrCompensationRequiredOnFailure:true,
  noTemporalMutation:true,
  noAvailabilityMutation:true,
  noGovernedInventoryMutation:true,
  noRuntimePropagationInBM2:true,
  separateRuntimePropagationAuthorizationRequired:true,
  separateBrowserVisibilityCertificationRequired:true,
  explicitBM2ExecutionAuthorizationRequired:true
 },
 nextMilestone:passed
  ?"M4.19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION"
  :"M4.19D4BM1_R3A_FINALIZATION_RECONCILIATION",
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

fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!passed) process.exit(2);
