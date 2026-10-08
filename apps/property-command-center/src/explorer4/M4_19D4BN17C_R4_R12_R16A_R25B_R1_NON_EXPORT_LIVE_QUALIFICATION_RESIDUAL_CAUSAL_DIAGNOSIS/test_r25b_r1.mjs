#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r25b_r1.py"),"utf8");
const q=[
"SINGLE_RECORD_NON_EXPORT_TARGET_BINDING_CAUSAL_DIAGNOSIS",
"NE of Interstate 15 and Stoddard Wells",
"firstTenQualified",
"firstFailureAtTargetBindingSettle",
"fiveSecondBindingWindowObserved",
"stoddardCollisionCandidatesCaptured",
"EVER_AMBIGUOUS_CONTAINS",
"STODDARD_WELLS_BASE_TARGET_COLLIDES_WITH_MULTIPLE_MORE_SPECIFIC_BUILDING_VARIANTS_UNIQUE_CONTAINS_BINDING_FORBIDDEN",
"STODDARD_WELLS_TARGET_BINDING_DELAYED_BUT_EVENTUALLY_UNIQUE",
"noPropertyClickPerformed",
"assignmentsInvocationOff",
"exportInvocationOff",
"M4_19D4BN17C_R4_R12_R16A_R25B_R2_COLLISION_SAFE_IDENTITY_BINDING_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25B_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25B_FIRST_TEN_QUALIFIED_RECORD_11_TARGET_BINDING_FAILURE_TO_SINGLE_RECORD_STODDARD_WELLS_BASE_VS_BUILDING_VARIANT_COLLISION_AND_TIMING_CAUSAL_DIAGNOSIS"
},null,2));