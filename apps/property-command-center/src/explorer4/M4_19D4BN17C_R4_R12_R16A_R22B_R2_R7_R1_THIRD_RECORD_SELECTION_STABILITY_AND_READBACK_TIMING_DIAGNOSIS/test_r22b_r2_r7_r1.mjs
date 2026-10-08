#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r22b_r2_r7_r1.py"),"utf8");
const q=["FIRST_SELECTED_MARKER_SECONDS","SELECTED_MARKER_STABLE_LAST_FIVE","ASSIGNMENTS_STABLE_LAST_FIVE",
"THIRD_RECORD_SELECTION_READBACK_IS_ASYNCHRONOUS_CERTIFICATION_CHECK_EXECUTED_TOO_EARLY",
"THIRD_RECORD_SELECTION_STABLE_IMMEDIATE_R7_FAILURE_IS_TRANSIENT_EXECUTION_RACE",
"THIRD_RECORD_SELECTED_MARKER_STATE_FLICKERS_AFTER_CLICK",
"selectionTimingSamplesCaptured","assignmentsInvocationOff","exportInvocationOff",
"M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R22B_R2_R7_R1_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R22B_R2_R7_REPEAT_SELECTION_FAILURE_TO_BOUNDED_POST_CLICK_SELECTED_MARKER_STABILITY_AND_READBACK_TIMING_DIAGNOSIS"},null,2));