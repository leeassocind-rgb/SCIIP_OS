#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r23d_r3_r2.py"),"utf8");
const q=[
"THIRD_RECORD_TARGET_NOT_MATERIALIZED_AT_SELECTION_TIME",
"FIRST_UNIQUE_EXPLORER_SECONDS",
"FIRST_EXPLORER_LIKE_SECONDS",
"FIRST_EXACT_TARGET_SECONDS",
"FIRST_CONTAINS_TARGET_SECONDS",
"FIRST_TARGET_MARKER_SECONDS",
"preExplorerSamples",
"postExplorerSamples",
"noPropertyClickPerformed",
"assignmentsInvocationOff",
"exportInvocationOff",
"THIRD_RECORD_FRESH_PAGE_EXPLORER_CONTROL_MATERIALIZATION_RACE_CONFIRMED",
"EXPLORER_ENTRY_REQUIRES_BOUNDED_MATERIALIZATION_WAIT",
"BOUNDED_EXPLORER_ENTRY_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R1_THIRD_RECORD_ZERO_EXPLORER_AND_ZERO_TARGET_BINDING_TO_FRESH_PAGE_EXPLORER_MATERIALIZATION_TIMING_AND_POST_ENTRY_TARGET_BINDING_DIAGNOSIS"
},null,2));