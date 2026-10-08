#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a13r1a-dry-run-certification-reconciliation.json");
const out=path.join(ev,"m4-19d4bj3a13r2-production-first-insert-store-adapter-implementation-preauthorization.json");

if(!fs.existsSync(prior)) throw new Error("BJ3A13R1A evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BJ3A13R1A_DRY_RUN_PIPELINE_CERTIFIED_PRODUCTION_ADAPTER_FIRST_INSERT_CAPABILITY_GAP_CONFIRMED_R2_PREAUTHORIZATION_READY")
  throw new Error(`BJ3A13R1A state mismatch: ${p.state}`);

console.log("[BJ3A13R2] dry-run pipeline certification accepted");
console.log("[BJ3A13R2] defining controlled production first-insert adapter contract; implementation remains OFF");

const design={
 capability:"GOVERNED_PRODUCTION_CANONICAL_FIRST_INSERT_STORE_ADAPTER",
 targetModule:"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js",
 factory:"buildGovernedCanonicalFirstInsertProductionStoreAdapter",
 requiredMethods:[
  "lookupBySourcePropertyId",
  "lookupByCanonicalPropertyId",
  "atomicInsert",
  "readAfterWrite"
 ],
 composition:{
  physicalStorageSubstrate:"CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",
  canonicalIdAuthority:"GovernedProductionCanonicalIdAuthorityRuntime.js",
  firstInsertPrimitive:"GovernedCanonicalIdentityFirstInsertRuntime.js"
 },
 atomicInsertContract:{
  absentTargetOnly:true,
  duplicateCanonicalIdMustBlock:true,
  duplicateSourcePropertyIdMustBlock:true,
  idempotencyKeyMustBlockReplay:true,
  creationEventTypeMustEqual:"CANONICAL_IDENTITY_CREATED",
  sourceAndAddressBindingRequired:true,
  atomicReplaceOrEquivalentDurabilityRequired:true,
  backupOrRollbackEvidenceRequiredBeforeFirstProductionExecution:true
 },
 readAfterWriteContract:{
  canonicalPropertyIdParity:true,
  sourcePropertyIdParity:true,
  idempotencyKeyParity:true,
  creationEventParity:true
 },
 prohibitions:{
  noUpdateExistingCanonicalRecord:true,
  noAvailabilityMutation:true,
  noTemporalAvailabilityMutation:true,
  noIdentityRewrite:true,
  noDownstreamPropagation:true,
  noNetworkRequest:true
 },
 certificationPlan:{
  implementationFirst:true,
  isolatedFilesystemFixtureCertificationRequired:true,
  productionCanonicalStoreReadOnlyCompatibilityCheckRequired:true,
  noProductionFirstInsertDuringImplementationCertification:true,
  separateFiveRecordRepreauthorizationRequired:true
 }
};

const designHash=crypto.createHash("sha256").update(JSON.stringify(design)).digest("hex");
const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A13R2_GOVERNED_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_PREAUTHORIZATION",
 version:"4.0-m4.19d4bj3a13r2",
 status:"PASSED",
 state:"M419D4BJ3A13R2_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",
 certifiedAt:new Date().toISOString(),
 adjudication:{
   genericFirstInsertPipelineCertified:true,
   physicalCanonicalStorageSubstratePresent:true,
   existingProductionAdapterCompleteFirstInsertContractPresent:false,
   controlledAdapterImplementationRequired:true
 },
 implementationPreauthorization:{
   implementationAuthorized:true,
   productionExecutionAuthorized:false,
   design,
   designHash
 },
 policy:{
   wrapOrComposeExistingPhysicalSubstrateRatherThanReplaceIt:true,
   existingUpdateAdapterSemanticsMustRemainUnchanged:true,
   productionCanonicalRecordsMustRemainUntouched:true,
   BJ4ExecutionStillProhibited:true,
   fiveRecordCohortStillUnauthorized:true
 },
 nextMilestone:"M4.19D4BJ3A14_GOVERNED_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_AND_ISOLATED_FILESYSTEM_CERTIFICATION",
 authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
   productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
   governedInventoryMutationPerformed:false,applicationMutationPerformed:false,
   identityCreationExecutedInProduction:false
 }
};

fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
