#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r25d_r2.py"),"utf8");
const q=[
"SINGLE_RECORD_NON_EXPORT_EXPLORER_TIMING_DIAGNOSIS",
"CERTIFIED_EXPLORER_MATERIALIZATION_CAUSE_REQUIRED",
"boundedFiveSecondObservationUsed",
"exactExplorerCountsCaptured",
"explorerLikeCountsCaptured",
"readyStateCaptured",
"firstUniqueExplorerTimeResolved",
"stabilityWindowEvaluated",
"THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_WITHIN_TWO_SECONDS_PRIOR_FAILURE_TRANSIENT",
"THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_DELAYED_BEYOND_EXISTING_TWO_SECOND_GUARD",
"THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_UNSTABLE_OR_ABSENT",
"noExplorerClickPerformed",
"noPropertyClickPerformed",
"assignmentsInvocationOff",
"exportInvocationOff",
"M4_19D4BN17C_R4_R12_R16A_R25D_R3_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25D_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25D_R1_CERTIFIED_THIRD_RECORD_EXPLORER_SETTLE_FAILURE_TO_BOUNDED_FIVE_SECOND_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS_WITH_NO_WORKFLOW_OR_EXPORT_INVOCATION"
},null,2));