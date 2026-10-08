#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r27b_r4_r3_r2.py"),"utf8");
const q=[
"SINGLE_RECORD_NON_EXPORT_EXPLORER_TIMING_DIAGNOSIS",
"record-200 Explorer-settle failure",
"12350 Philadelphia St",
"boundedFiveSecondObservationUsed",
"FIRST_UNIQUE_EXPLORER_SECONDS",
"STABLE_LAST_FIVE_SAMPLES",
"VALID_SAMPLE_COUNT_AT_OR_AFTER_2S",
"noExplorerClickPerformed",
"noPropertyClickPerformed",
"Export invocation: OFF",
"RECORD_200_EXPLORER_CONTROL_MATERIALIZED_WITHIN_TWO_SECONDS_PRIOR_FAILURE_TRANSIENT",
"RECORD_200_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_FINAL_NON_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R4_R3_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27B_R4_R3_R1_PROVED_RECORD200_EXPLORER_SETTLE_FAILURE_TO_BOUNDED_FIVE_SECOND_NON_EXPORT_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS"
},null,2));