#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bmPath=path.join(ev,"m4-19d4bm-next-controlled-ten-property-cohort-readiness-and-selection.json");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const runtimePath=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const firstInsertPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
const eventAdapterPath=path.join(app,"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js");
const out=path.join(ev,"m4-19d4bm1-controlled-ten-property-canonical-identity-creation-execution-preauthorization.json");

for(const p of [bmPath,canonicalPath,eventPath,runtimePath,inventoryPath,authorityPath,firstInsertPath,eventAdapterPath])
  if(!fs.existsSync(p)) throw new Error("required input missing: "+p);

const BM=JSON.parse(fs.readFileSync(bmPath,"utf8"));
if(BM.state!=="M419D4BM_NEXT_CONTROLLED_TEN_PROPERTY_COHORT_DETERMINISTICALLY_SELECTED_CREATION_PREAUTHORIZATION_READY")
  throw new Error("BM state mismatch");
if(BM.selection?.size!==10 || BM.preauthorization?.maximumCanonicalIdentityCreations!==10)
  throw new Error("BM ten-property cohort not certified");

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

if(hashes.inventory!==BM.sourceBinding?.hashes?.inventory) throw new Error("inventory drift since BM");
if(hashes.canonical!==BM.sourceBinding?.hashes?.canonical) throw new Error("canonical drift since BM");
if(hashes.events!==BM.sourceBinding?.hashes?.events) throw new Error("event drift since BM");
if(hashes.runtime!==BM.sourceBinding?.hashes?.runtime) throw new Error("runtime drift since BM");

const authorityMod=await import(pathToFileURL(authorityPath).href+"?bm1="+Date.now());
if(typeof authorityMod.buildGovernedProductionCanonicalIdAuthority!=="function")
  throw new Error("canonical ID authority factory missing");

const authority=authorityMod.buildGovernedProductionCanonicalIdAuthority({
  namespacePrefixLength:20
});
if(!authority || typeof authority.resolveCanonicalPropertyId!=="function")
  throw new Error("canonical ID authority method missing");

function collect(x,out=[]){
  if(Array.isArray(x)){ for(const v of x) collect(v,out); }
  else if(x&&typeof x==="object"){ out.push(x); for(const v of Object.values(x)) if(v&&typeof v==="object") collect(v,out); }
  return out;
}
const canonicalObjects=collect(JSON.parse(fs.readFileSync(canonicalPath,"utf8")));
const existingIds=new Set(canonicalObjects.map(x=>x?.canonicalPropertyId).filter(Boolean));
const existingSources=new Set(canonicalObjects.map(x=>x?.sourcePropertyId).filter(Boolean));
const existingAddresses=new Set(canonicalObjects.map(x=>String(x?.normalizedAddress||x?.address||"").trim().toLowerCase()).filter(Boolean));

const eventRows=fs.readFileSync(eventPath,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const eventIds=new Set(eventRows.map(x=>x?.canonicalPropertyId).filter(Boolean));
const eventSources=new Set(eventRows.map(x=>x?.sourcePropertyId).filter(Boolean));

const cohort=BM.selection.cohort;
const derived=[];

for(const r of [...cohort].sort((a,b)=>a.cohortPosition-b.cohortPosition)){
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

  const resolution=authority.resolveCanonicalPropertyId({
    sourcePropertyId:r.sourcePropertyId,
    normalizedAddress:r.address,
    sourceProvenance,
    identityEvidence
  });

  if(!resolution?.canonicalPropertyId) throw new Error("canonical ID derivation failed for "+r.sourcePropertyId);

  const canonicalPropertyId=resolution.canonicalPropertyId;
  const collisionExisting=existingIds.has(canonicalPropertyId);
  const duplicateSourceExisting=existingSources.has(r.sourcePropertyId);
  const duplicateAddressExisting=existingAddresses.has(r.address.trim().toLowerCase());
  const eventCanonicalExisting=eventIds.has(canonicalPropertyId);
  const eventSourceExisting=eventSources.has(r.sourcePropertyId);

  const idempotencyKey="CANONICAL_FIRST_INSERT:"+crypto.createHash("sha256")
    .update(`${canonicalPropertyId}|${r.sourcePropertyId}|${resolution.derivationHash}`)
    .digest("hex");

  const preauthorizationInputHash=crypto.createHash("sha256").update(JSON.stringify({
    cohortPosition:r.cohortPosition,
    sourcePropertyId:r.sourcePropertyId,
    normalizedAddress:r.address,
    sourceProvenance,
    identityEvidence,
    canonicalPropertyId,
    authorityReference:resolution.authorityReference,
    derivationHash:resolution.derivationHash,
    idempotencyKey
  })).digest("hex");

  derived.push({
    cohortPosition:r.cohortPosition,
    sourcePropertyId:r.sourcePropertyId,
    address:r.address,
    city:r.city,
    state:r.state,
    buildingSf:r.buildingSf,
    status:r.status,
    canonicalPropertyId,
    authorityVersion:resolution.authorityVersion,
    derivationVersion:resolution.derivationVersion,
    derivationHash:resolution.derivationHash,
    authorityReference:resolution.authorityReference,
    resolutionState:resolution.resolutionState,
    idempotencyKey,
    sourceProvenance,
    identityEvidence,
    collisionExisting,
    duplicateSourceExisting,
    duplicateAddressExisting,
    eventCanonicalExisting,
    eventSourceExisting,
    preauthorizationInputHash,
    executionAuthorized:false
  });
}

const ids=derived.map(x=>x.canonicalPropertyId);
const idempotencyKeys=derived.map(x=>x.idempotencyKey);
const checks={
  bmSelectionCertified:BM.preauthorization?.cohortSelectionCertified===true,
  exactTenTargets:derived.length===10,
  cohortHashStable:BM.selection?.cohortHash==="238ec8b8fb135de1cff80b773ed73662cce4f68b96b2b8a8dbbb54898c40de4d",
  inventoryHashStable:hashes.inventory===BM.sourceBinding.hashes.inventory,
  canonicalHashStable:hashes.canonical===BM.sourceBinding.hashes.canonical,
  eventHashStable:hashes.events===BM.sourceBinding.hashes.events,
  runtimeHashStable:hashes.runtime===BM.sourceBinding.hashes.runtime,
  canonicalRuntimeParity:hashes.canonical===hashes.runtime,
  authorityRuntimePresent:true,
  firstInsertAdapterPresent:true,
  eventAdapterPresent:true,
  allCanonicalIdsDerived:derived.every(x=>/^CPROP-[0-9A-F]{20}$/.test(x.canonicalPropertyId)),
  canonicalIdsUnique:new Set(ids).size===10,
  idempotencyKeysUnique:new Set(idempotencyKeys).size===10,
  noCanonicalCollisions:derived.every(x=>!x.collisionExisting),
  noDuplicateSources:derived.every(x=>!x.duplicateSourceExisting),
  noDuplicateAddresses:derived.every(x=>!x.duplicateAddressExisting),
  noPriorCreationEventsByCanonical:derived.every(x=>!x.eventCanonicalExisting),
  noPriorCreationEventsBySource:derived.every(x=>!x.eventSourceExisting),
  allResolutionStatesReady:derived.every(x=>x.resolutionState==="DERIVED_CANONICAL_ID_AVAILABLE"),
  allAuthorityReferencesBound:derived.every(x=>typeof x.authorityReference==="string"&&x.authorityReference.length>0)
};

const passed=Object.values(checks).every(Boolean);
const frozenExecutionManifest={
  cohortHash:BM.selection.cohortHash,
  maximumCanonicalIdentityCreations:10,
  canonicalStore:canonicalPath,
  eventStore:eventPath,
  runtimeMirror:runtimePath,
  authorityRuntime:{
    path:authorityPath,
    sha256:hashes.authority,
    factory:"buildGovernedProductionCanonicalIdAuthority",
    method:"resolveCanonicalPropertyId"
  },
  firstInsertAdapter:{
    path:firstInsertPath,
    sha256:hashes.firstInsertAdapter,
    factory:"buildGovernedCanonicalFirstInsertProductionStoreAdapter"
  },
  creationEventAdapter:{
    path:eventAdapterPath,
    sha256:hashes.eventAdapter,
    factory:"buildGovernedCanonicalCreationEventStoreAdapter"
  },
  records:derived.map(x=>({
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
  contract:"SCIIP_EXPLORER_4_M4_19D4BM1_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION_PREAUTHORIZATION",
  version:"4.0-m4.19d4bm1",
  status:passed?"PASSED":"BLOCKED",
  state:passed
    ?"M419D4BM1_TEN_PROPERTY_CANONICAL_IDS_DERIVED_COLLISION_FREE_EXECUTION_MANIFEST_FROZEN_PRODUCTION_EXECUTION_NOT_AUTHORIZED"
    :"M419D4BM1_TEN_PROPERTY_CREATION_PREAUTHORIZATION_BLOCKED",
  certifiedAt:new Date().toISOString(),
  cohort:{
    size:10,
    cohortHash:BM.selection.cohortHash,
    records:derived
  },
  runtimeBindings:{
    hashes,
    canonicalIdAuthority:{
      module:authorityPath,
      factory:"buildGovernedProductionCanonicalIdAuthority",
      method:"resolveCanonicalPropertyId"
    },
    firstInsertAdapter:{
      module:firstInsertPath,
      factory:"buildGovernedCanonicalFirstInsertProductionStoreAdapter"
    },
    creationEventAdapter:{
      module:eventAdapterPath,
      factory:"buildGovernedCanonicalCreationEventStoreAdapter"
    }
  },
  checks,
  executionPreauthorization:{
    preauthorized:passed,
    executionAuthorized:false,
    maximumCanonicalIdentityCreations:10,
    frozenExecutionManifest,
    executionManifestHash,
    strictSequentialExecution:true,
    haltOnFirstFailure:true,
    immediateDuplicateRecheckBeforeEachInsert:true,
    canonicalReadAfterWriteRequired:true,
    eventAppendAfterCanonicalCommitRequired:true,
    eventReadAfterAppendRequired:true,
    rollbackOrCompensationRequiredOnFailure:true,
    noTemporalOrAvailabilityMutation:true,
    noGovernedInventoryMutation:true,
    noRuntimePropagationInCreationMilestone:true,
    explicitFutureExecutionAuthorizationRequired:true
  },
  policy:{
    readOnlyPreauthorization:true,
    productionExecutionNotPerformed:true,
    broadScaleOutAuthorized:false,
    maximumTen:true,
    directSyntheticCanonicalIdGenerationProhibited:true,
    certifiedCanonicalIdAuthorityRequired:true,
    runtimePropagationRequiresSeparateMilestone:true,
    browserVisibilityRequiresSeparateCertification:true
  },
  nextMilestone:passed
    ?"M4.19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION"
    :"M4.19D4BM1_R1_PREAUTHORIZATION_RECONCILIATION",
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
