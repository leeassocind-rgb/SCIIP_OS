#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a13-r1-production-first-insert-store-adapter-binding-and-dry-run-certification.json");
const out=path.join(ev,"m4-19d4bj3a13r1a-dry-run-certification-reconciliation.json");

if(!fs.existsSync(prior)) throw new Error("BJ3A13-R1 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BJ3A13_R1_DRY_RUN_CERTIFICATION_BLOCKED_RECONCILIATION_REQUIRED")
  throw new Error(`BJ3A13-R1 state mismatch: ${p.state}`);

console.log("[BJ3A13R1A] reconciling dry-run certification boolean semantics");

const priorChecks=p.dryRunCertification?.checks||{};
const positiveChecks=[
  "namespaceTwentyHexCertified",
  "repositoryRootAuthorityImportResolved",
  "repositoryRootFirstInsertImportResolved",
  "productionAdapterFactoryPresent",
  "productionPhysicalAtomicWritePresent",
  "productionReadBindingPresent",
  "dryRunPreflightReady",
  "dryRunUnauthorizedBlocked",
  "dryRunFirstInsertCommitted",
  "dryRunCreationEventCorrect",
  "dryRunReadAfterWriteVerified",
  "dryRunReplayBlocked",
  "shadowAtomicInsertExactlyOnce",
  "shadowReadAfterWriteExactlyOnce"
];

const positiveCheckResults=Object.fromEntries(positiveChecks.map(k=>[k,priorChecks[k]===true]));
const safetyChecks={
  productionMutationNotPerformed: priorChecks.productionMutationPerformed===false,
  productionCanonicalMutationNotPerformed:p.safety?.productionCanonicalMutationPerformed===false,
  productionIdentityMutationNotPerformed:p.safety?.productionIdentityMutationPerformed===false,
  temporalMutationNotPerformed:p.safety?.temporalMutationPerformed===false,
  governedInventoryMutationNotPerformed:p.safety?.governedInventoryMutationPerformed===false,
  networkRequestsZero:p.safety?.networkRequestsPerformed===0
};

const positivePassed=Object.values(positiveCheckResults).every(Boolean);
const safetyPassed=Object.values(safetyChecks).every(Boolean);
const correctedDryRunPassed=positivePassed && safetyPassed;
const adapterNeedsImplementation=
  p.productionStoreInspection?.directProductionStoreBindingReady===false &&
  p.productionStoreInspection?.contract?.hasFactory===true &&
  p.productionStoreInspection?.contract?.hasPhysicalAtomicWrite===true &&
  p.productionStoreInspection?.contract?.hasReadBinding===true &&
  p.productionStoreInspection?.contract?.hasAtomicInsertCallable===false &&
  p.productionStoreInspection?.contract?.hasReadAfterWriteCallable===false &&
  p.productionStoreInspection?.contract?.rejectsMissingTarget===true;

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A13R1A_DRY_RUN_CERTIFICATION_RECONCILIATION",
 version:"4.0-m4.19d4bj3a13r1a",
 status:correctedDryRunPassed?"PASSED":"BLOCKED",
 state:correctedDryRunPassed && adapterNeedsImplementation
   ?"M419D4BJ3A13R1A_DRY_RUN_PIPELINE_CERTIFIED_PRODUCTION_ADAPTER_FIRST_INSERT_CAPABILITY_GAP_CONFIRMED_R2_PREAUTHORIZATION_READY"
   :"M419D4BJ3A13R1A_RECONCILIATION_NOT_READY",
 certifiedAt:new Date().toISOString(),
 correction:{
   priorBooleanDefect:"productionMutationPerformed:false was incorrectly included in Object.values(checks).every(Boolean)",
   correctedPositiveCheckEvaluation:true,
   correctedNegativeSafetyCheckEvaluation:true,
   priorGenericPipelineDryRunPassed:p.dryRunCertification?.genericPipelineDryRunPassed,
   correctedGenericPipelineDryRunPassed:correctedDryRunPassed
 },
 certification:{
   positiveCheckResults,
   safetyChecks,
   positivePassed,
   safetyPassed,
   correctedDryRunPassed,
   shadowRecordCount:p.dryRunCertification?.shadowRecordCount??null,
   priorCommitted:p.dryRunCertification?.committed??null,
   priorReplay:p.dryRunCertification?.replay??null
 },
 adapterGap:{
   confirmed:adapterNeedsImplementation,
   hasFactory:p.productionStoreInspection?.contract?.hasFactory??null,
   hasPhysicalAtomicWrite:p.productionStoreInspection?.contract?.hasPhysicalAtomicWrite??null,
   hasReadBinding:p.productionStoreInspection?.contract?.hasReadBinding??null,
   hasAtomicInsertCallable:p.productionStoreInspection?.contract?.hasAtomicInsertCallable??null,
   hasReadAfterWriteCallable:p.productionStoreInspection?.contract?.hasReadAfterWriteCallable??null,
   rejectsMissingTarget:p.productionStoreInspection?.contract?.rejectsMissingTarget??null
 },
 policy:{
   priorShadowExecutionAcceptedAsCertificationEvidence:true,
   noShadowRerunRequired:true,
   noProductionWrite:true,
   BJ4ExecutionStillProhibited:true
 },
 nextMilestone:correctedDryRunPassed && adapterNeedsImplementation
   ?"M4.19D4BJ3A13R2_GOVERNED_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_PREAUTHORIZATION"
   :"M4.19D4BJ3A13R1B_FURTHER_RECONCILIATION",
 authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
   productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
   governedInventoryMutationPerformed:false,applicationMutationPerformed:false,
   shadowFixtureMutationPerformed:false
 }
};

fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!correctedDryRunPassed) process.exit(2);
