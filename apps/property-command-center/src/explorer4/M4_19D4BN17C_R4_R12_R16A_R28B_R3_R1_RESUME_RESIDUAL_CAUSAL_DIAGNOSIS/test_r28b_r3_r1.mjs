#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r28b_r3_r1.py"),"utf8");
const q=[
"READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS",
"certifiedBeforeFailureExactly32",
"firstFailureOrdinal233",
"firstFailureTarget13310ValleyBlvd",
"failedStageResolved",
"failureOriginChanged",
"allPreOriginStagesCertified",
"record201RepairPreserved",
"firstThirtyTwoCertifiedPreserved",
"RECORD_233_ALL_NON_EXPORT_WORKFLOW_STAGES_CERTIFIED_BUT_FINAL_SAME_ORIGIN_READBACK_FAILED",
"R28B_R3_R2_RECORD_233_POST_REPORT_REVIEW_ORIGIN_TRANSITION_DEEP_DIAGNOSIS",
"Resume retry: OFF",
"Live UI interaction: OFF",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_R3_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_R3_CERTIFIED_32_OF_200_THEN_RECORD233_ORIGIN_CHANGED_AFTER_ALL_NON_EXPORT_WORKFLOW_STAGES_TO_READ_ONLY_EXACT_STAGE_CAUSAL_DIAGNOSIS_WITH_PRIOR32_PRESERVED"
},null,2));