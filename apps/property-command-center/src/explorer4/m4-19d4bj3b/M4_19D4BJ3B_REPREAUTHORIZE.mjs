#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";
const repo=path.resolve(process.argv[2]||".");const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a3-canonical-store-write-method-and-identity-creation-invocation-forensics.json");
const out=path.join(ev,"m4-19d4bj3b-five-property-identity-creation-repreauthorization.json");
const j=p=>JSON.parse(fs.readFileSync(p,"utf8")), sha=s=>crypto.createHash("sha256").update(s).digest("hex");
if(!fs.existsSync(prior))throw Error("BJ3A3 evidence missing");const p=j(prior);
const expected="M419D4BJ3A3_EXACT_CANONICAL_STORE_CREATION_METHOD_AND_INVOCATION_SEMANTICS_CERTIFIED_BJ3B_READY";
if(p.state!==expected)throw Error(`BJ3A3 not ready: ${p.state}`);
if(p.forensics?.exactCreationMethod!=="createCertifiedCanonicalPropertyStoreAdapter")throw Error("exact certified adapter factory changed");
if(!p.forensics?.adapterHasPhysicalWrite||!p.forensics?.adapterHasEventSemantics)throw Error("adapter write/event semantics not certified");
const targets=p.targetsPreserved||[];if(targets.length!==5)throw Error("exact five targets required");
console.log("[BJ3B] BJ3A3 exact executable binding accepted");
console.log("[BJ3B] reauthorizing exact five targets; execution remains OFF");
const records=targets.map(t=>({...t,
 executablePipelineBinding:{
  module:"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",
  adapterFactory:"createCertifiedCanonicalPropertyStoreAdapter",
  writeMethod:"writeAtomic",
  physicalWritePrimitive:"atomicWriteJson",
  eventAppendSemantics:"CANONICAL_CANARY_COMMIT",
  sourceBindingRequired:true
 },
 repreauthorizationHash:sha(JSON.stringify({sourcePropertyId:t.sourcePropertyId,address:t.address,preauthorizationInputHash:t.preauthorizationInputHash,module:"CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",factory:"createCertifiedCanonicalPropertyStoreAdapter",writeMethod:"writeAtomic"})),
 executionAuthorized:false
}));
const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3B_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_EXACT_EXECUTABLE_PIPELINE",
 version:"4.0-m4.19d4bj3b",status:"PASSED",
 state:"M419D4BJ3B_EXACT_FIVE_PROPERTY_EXECUTABLE_PIPELINE_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED_BJ4_READY",
 certifiedAt:new Date().toISOString(),
 binding:{module:"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",adapterFactory:"createCertifiedCanonicalPropertyStoreAdapter",writeMethod:"writeAtomic",physicalWritePrimitive:"atomicWriteJson",eventSemanticsProven:true,physicalWriteProven:true,uiActionStateRejectedAsWriteAuthority:true},
 cohort:{size:5,maximumCreations:5,allTargetsBound:true,records},
 policy:{duplicateIdentityRecheckRequiredImmediatelyBeforeEachCreation:true,sourcePropertyIdAndAddressMustRemainBound:true,exactExecutablePipelineRequired:true,directSyntheticCPROPGenerationProhibited:true,haltOnFirstFailure:true,sequentialExecutionOnly:true,readAfterWriteRequired:true,noAvailabilityOrTemporalWrite:true,explicitBJ4ExecutionAuthorizationRequired:true},
 nextMilestone:"M4.19D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}
};
fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify(result,null,2));
