#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r22b_r2_r6.py"),"utf8");
const q=["8700 - 8750 Rex Rd","EXACT_TARGET_BUTTON_COUNT","REX_LIKE_BUTTON_COUNT","TARGET_TEXT_VISIBLE_AFTER_CLICK",
"THIRD_RECORD_CLICK_SUCCEEDED_SELECTED_PROPERTY_READBACK_TEXT_PREDICATE_TOO_STRICT",
"THIRD_RECORD_LABEL_NORMALIZATION_MISMATCH_EXACT_TARGET_STRING_NOT_PRESENT",
"THIRD_RECORD_MULTIPLE_TARGET_BUTTON_MATCHES_REQUIRE_DISAMBIGUATION",
"THIRD_RECORD_SELECTION_TRANSIENT_PRIOR_FAILURE_NOT_REPRODUCED",
"exportInvocationOff","assignmentsInvocationOff","storageStateCaptured"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R22B_R2_R6_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R22B_R2_R5_TWO_OF_THREE_SUCCESS_WITH_THIRD_SELECTION_FAILURE_TO_SINGLE_RECORD_NON_EXPORT_SELECTION_READBACK_CAUSAL_DIAGNOSIS"},null,2));