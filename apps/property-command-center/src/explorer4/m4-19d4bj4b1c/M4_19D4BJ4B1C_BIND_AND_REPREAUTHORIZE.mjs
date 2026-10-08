#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const b1b=path.join(ev,"m4-19d4bj4b1b-governed-canonical-creation-event-store-adapter-implementation-and-isolated-filesystem-certification.json");
const b1a=path.join(ev,"m4-19d4bj4b1a-governed-canonical-creation-event-store-adapter-design-and-preauthorization.json");
const a3=path.join(ev,"m4-19d4bj4a3-r2-event-store-binding-state-reconciliation-and-bj4b-readiness.json");
const runtime=path.join(app,"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js");
const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const out=path.join(ev,"m4-19d4bj4b1c-production-canonical-creation-event-store-path-binding-and-reexecution-repreauthorization.json");

for(const p of [b1b,b1a,a3,runtime,canonical]) if(!fs.existsSync(p)) throw new Error("required prerequisite missing: "+p);
const B=JSON.parse(fs.readFileSync(b1b,"utf8"));
const A=JSON.parse(fs.readFileSync(b1a,"utf8"));
const R=JSON.parse(fs.readFileSync(a3,"utf8"));
if(B.state!=="M419D4BJ4B1B_CANONICAL_CREATION_EVENT_STORE_ADAPTER_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_PRODUCTION_BINDING_PREAUTHORIZATION_READY") throw new Error("BJ4B1B state mismatch");
if(A.designHash!==B.designBinding?.designHash) throw new Error("design hash drift");
if(B.designBinding?.cohort?.cohortHash!=="fba1de9380ea69850e41ae83968b4d26c29d1f0a7372f7b2b2d26b2b981c2fdd") throw new Error("frozen cohort hash drift");
if(R.state!=="M419D4BJ4A3_R2_EXISTING_CANONICAL_EVENT_STORE_BINDING_PRESERVED_NEW_STORE_DESIGN_NOT_REQUIRED_BJ4B_READY") throw new Error("A3-R2 state mismatch");

console.log("[BJ4B1C] BJ4B1B implementation + isolated certification accepted");
console.log("[BJ4B1C] binding explicit production event-store path; NO FILE CREATION / NO WRITE");
console.log("[BJ4B1C] reauthorizing reexecution prerequisites only; BJ4 retry remains OFF");

const canonicalSha=crypto.createHash("sha256").update(fs.readFileSync(canonical)).digest("hex");
const runtimeSha=crypto.createHash("sha256").update(fs.readFileSync(runtime)).digest("hex");
const eventExists=fs.existsSync(eventPath);
const parentExists=fs.existsSync(path.dirname(eventPath));

const checks={
  b1bCertified:true,
  designHashStable:true,
  cohortHashStable:true,
  a3R2ReadinessPreserved:true,
  adapterRuntimePresent:true,
  adapterRuntimeShaMatchesCertification:runtimeSha===B.implementation?.sourceSha256,
  authoritativeCanonicalStorePresent:true,
  productionEventStorePathRepositoryRelative:path.relative(app,eventPath)==="src/production-validation/canonical-identity-creation-events.jsonl",
  productionEventStoreParentExists:parentExists,
  productionEventStoreStillAbsent:eventExists===false,
  noWritePerformed:true
};
const passed=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B1C_PRODUCTION_CANONICAL_CREATION_EVENT_STORE_PATH_BINDING_AND_REEXECUTION_REPREAUTHORIZATION",
 version:"4.0-m4.19d4bj4b1c",
 status:passed?"PASSED":"BLOCKED",
 state:passed?"M419D4BJ4B1C_PRODUCTION_EVENT_STORE_PATH_EXPLICITLY_BOUND_FIVE_PROPERTY_REEXECUTION_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED_BJ4B2_READY":"M419D4BJ4B1C_BINDING_OR_REPREAUTHORIZATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 productionBinding:{
   canonicalStore:{path:canonical,sha256:canonicalSha,mode:"READ_ONLY_IN_THIS_MILESTONE"},
   creationEventStore:{path:eventPath,format:"JSONL_APPEND_ONLY",existsBeforeExecution:eventExists,creationAuthorized:false},
   adapter:{path:runtime,sha256:runtimeSha,factory:"buildGovernedCanonicalCreationEventStoreAdapter"},
   pathResolution:"EXPLICIT_REPOSITORY_RELATIVE_CERTIFIED_PATH"
 },
 cohort:{
   size:5,
   cohortHash:B.designBinding.cohort.cohortHash,
   frozenHashMatches:true
 },
 checks,
 reexecutionPreauthorization:{
   repreauthorized:true,
   executionAuthorized:false,
   maximumCanonicalIdentityCreations:5,
   sequentialExecutionRequired:true,
   haltOnFirstFailure:true,
   duplicateRecheckBeforeEachInsert:true,
   canonicalReadAfterWriteRequired:true,
   eventAppendAfterCanonicalCommitRequired:true,
   eventReadAfterAppendRequired:true,
   rollbackOrCompensationRequiredOnEventAppendFailure:true,
   noAvailabilityOrTemporalMutation:true,
   noPropagation:true
 },
 policy:{
   productionEventStoreMayBeCreatedOnlyByExplicitFutureExecution:true,
   noProductionWriteInThisMilestone:true,
   BJ4RetryNotPerformed:true,
   explicitBJ4B2ExecutionAuthorizationRequired:true
 },
 nextMilestone:passed?"M4.19D4BJ4B2_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_AND_DUAL_STORE_POST_COMMIT_CERTIFICATION":"M4.19D4BJ4B1C_R1_RECONCILIATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,applicationMutationPerformed:false,automaticRetry:false}
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!passed) process.exit(2);
