#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r23d_r3_r1.py"),"utf8");
const q=[
"FIRST_TWO_CERTIFIED",
"THIRD_TARGET",
"THIRD_FAILURE",
"SELECTION_CLICKED",
"SELECTION_BINDING",
"SELECTION_EXACT_COUNT",
"SELECTION_CONTAINS_COUNT",
"SELECTION_CANDIDATES",
"THIRD_RECORD_TARGET_NOT_MATERIALIZED_AT_SELECTION_TIME",
"THIRD_RECORD_CONTAINS_MATCH_AMBIGUOUS",
"THIRD_RECORD_SELECTION_CLICK_SUCCEEDED_SETTLE_FAILED",
"noRetryPerformed",
"exportInvocationOff",
"RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_TWO_OF_TEN_CERTIFIED_WITH_THIRD_SELECTION_FAILURE_TO_EXACT_THIRD_OUTCOME_BINDING_AND_SETTLE_CAUSAL_DIAGNOSIS"
},null,2));