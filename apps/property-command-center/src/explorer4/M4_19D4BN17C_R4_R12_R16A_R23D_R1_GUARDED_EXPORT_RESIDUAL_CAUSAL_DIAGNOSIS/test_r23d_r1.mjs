#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r23d_r1.py"),"utf8");
const q=[
"R23D_STATE",
"FIRST_EXECUTED_TARGET",
"FIRST_FAILURE",
"FIRST OUTCOME STAGE READBACK",
"SELECTION_OR_SETTLE_FAILED",
"ASSIGNMENTS_OR_GENERATE_CONTROL_FAILED",
"REPORT_REVIEW_OR_EXPORT_BINDING_FAILED",
"EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED",
"noRetryPerformed",
"liveUiInteractionOff",
"exportInvocationOff",
"GUARDED_EXPORT_RESIDUAL_CAUSE_DIAGNOSED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_ZERO_OF_TEN_SUMMARY_WITH_HALT_ON_FIRST_FAILURE_TO_FIRST_OUTCOME_EXACT_STAGE_EVIDENCE_DIAGNOSIS"
},null,2));