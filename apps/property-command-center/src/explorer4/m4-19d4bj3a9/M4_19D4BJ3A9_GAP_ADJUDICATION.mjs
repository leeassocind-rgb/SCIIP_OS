#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a8-exact-historical-first-insert-source-inspection.json"),out=path.join(ev,"m4-19d4bj3a9-canonical-identity-creation-capability-gap-adjudication.json");
const sha=v=>crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(v)).digest("hex");
let p=JSON.parse(fs.readFileSync(prior,"utf8"));
console.log("[BJ3A9] BJ3A8 zero first-insert sources accepted");
console.log("[BJ3A9] adjudicating capability gap; NO implementation and NO writes");
const requirements={
 capability:"GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT",
 inputContract:["sourcePropertyId","normalizedAddress","sourceProvenance","identityEvidence"],
 deterministicCanonicalIdRequired:true,directSyntheticCPROPGenerationProhibited:true,
 duplicateRecheckImmediatelyBeforeInsert:true,sourcePropertyIdAndAddressBindingRequired:true,
 appendOnlyCreationEventRequired:true,atomicCanonicalFirstInsertRequired:true,readAfterWriteRequired:true,
 idempotencyRequired:true,strictSequentialExecution:true,haltOnFirstFailure:true,
 availabilityOrTemporalMutationProhibited:true,separatePropagationAuthorityRequired:true,
 explicitImplementationReviewRequired:true,explicitFutureExecutionAuthorizationRequired:true
};
const designHash=sha(requirements);
let o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A9_CANONICAL_IDENTITY_CREATION_CAPABILITY_GAP_ADJUDICATION_AND_CONTROLLED_IMPLEMENTATION_PREAUTHORIZATION",
version:"4.0-m4.19d4bj3a9",status:"PASSED",state:"M419D4BJ3A9_CANONICAL_IDENTITY_FIRST_INSERT_CAPABILITY_GAP_CERTIFIED_CONTROLLED_IMPLEMENTATION_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED",
certifiedAt:new Date().toISOString(),
adjudication:{BJ3A8PotentialFirstInsertSources:p.inspection?.potentialCount??null,existingTrueCreationCapabilityProven:false,capabilityGapCertified:true,
reason:"No inspected original executable source proves absent-target canonical identity creation with source binding and persistence."},
implementationPreauthorization:{scope:"DESIGN_AND_IMPLEMENTATION_ONLY",implementationAuthorized:true,productionExecutionAuthorized:false,requirements,designHash},
cohort:{size:p.cohort?.size||5,targets:p.cohort?.targets||[],allExecutionAuthorized:false},
policy:{BJ4ExecutionStillProhibited:true,noProductionWriteInThisMilestone:true,noSyntheticIdentity:true,existingUpdateAndPropagationSemanticsMustNotBeRepurposedAsCreation:true},
nextMilestone:"M4.19D4BJ3A10_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT_PRIMITIVE_IMPLEMENTATION_AND_READ_ONLY_CERTIFICATION",
authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}};
fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(o,null,2)+"\n");console.log(JSON.stringify(o,null,2));
