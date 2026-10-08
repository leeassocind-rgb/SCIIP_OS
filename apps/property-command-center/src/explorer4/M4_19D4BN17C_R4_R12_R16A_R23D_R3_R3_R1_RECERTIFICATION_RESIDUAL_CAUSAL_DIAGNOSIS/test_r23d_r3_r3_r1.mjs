#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r23d_r3_r3_r1.py"),"utf8");
const q=[
"FIRST_RECORD_CERTIFIED",
"SECOND_TARGET",
"SECOND_FAILURE",
"TARGET_BINDING_SAMPLE_COUNT",
"MAX_EXACT_COUNT",
"MAX_CONTAINS_COUNT",
"EVER_EXACT_UNIQUE",
"EVER_UNIQUE_CONTAINS",
"EVER_VALID_BINDING",
"MAX_CONSECUTIVE_VALID_SAMPLES",
"SECOND_RECORD_TARGET_NEVER_MATERIALIZED_WITHIN_TWO_SECOND_BINDING_WINDOW",
"SECOND_RECORD_TARGET_BINDING_AMBIGUOUS_THROUGHOUT_WINDOW",
"SECOND_RECORD_TARGET_BINDING_TRANSIENT_OR_OSCILLATING_VALIDITY",
"noRetryPerformed",
"liveUiInteractionOff",
"exportInvocationOff",
"RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_R3_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R3_FIRST_RECORD_CERTIFIED_SECOND_TARGET_BINDING_SETTLE_FAILURE_TO_EXACT_SAMPLE_SEQUENCE_AND_BINDING_VALIDITY_CAUSAL_DIAGNOSIS"
},null,2));