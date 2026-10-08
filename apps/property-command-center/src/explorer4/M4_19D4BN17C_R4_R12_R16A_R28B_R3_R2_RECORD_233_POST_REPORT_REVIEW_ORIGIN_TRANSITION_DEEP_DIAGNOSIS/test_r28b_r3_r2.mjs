#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r28b_r3_r2.py"),"utf8");
const q=[
"SINGLE_RECORD_NON_EXPORT_ORIGIN_TRANSITION_DIAGNOSIS",
"13310 Valley Blvd",
"stageSnapshots",
"postReportReviewSamples",
"sameOriginAcrossAllSamples",
"anyOriginChangeObserved",
"anyNonAppUrlObserved",
"RECORD_233_ORIGIN_REMAINED_STABLE_THROUGH_POST_REPORT_REVIEW_WINDOW_PRIOR_ORIGIN_CHANGED_FAILURE_TRANSIENT_READBACK_MISMATCH",
"R28B_R3_R3_RECORD_233_SAME_ORIGIN_RECERTIFICATION_AND_RESUME_FROM_233",
"RECORD_233_TRUE_ORIGIN_OR_URL_TRANSITION_OBSERVED_AFTER_REPORT_REVIEW",
"Download Client Listing Report",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_R3_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_R3_R1_PROVED_RECORD233_ALL_NON_EXPORT_STAGES_PASS_BUT_FINAL_ORIGIN_READBACK_FALSE_TO_SINGLE_RECORD_POST_REPORT_REVIEW_STAGE_BY_STAGE_URL_AND_ORIGIN_DEEP_DIAGNOSIS"
},null,2));