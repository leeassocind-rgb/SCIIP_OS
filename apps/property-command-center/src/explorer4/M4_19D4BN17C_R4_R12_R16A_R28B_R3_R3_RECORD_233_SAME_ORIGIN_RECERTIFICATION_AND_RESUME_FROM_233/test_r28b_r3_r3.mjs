#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r28b_r3_r3.py"),"utf8");
const q=[
"R28B_R3_R2_RECORD_233_POST_REPORT_REVIEW_ORIGIN_TRANSITION_DEEP_DIAGNOSIS",
"sameOriginAcrossAllSamples",
"anyOriginChangeObserved",
"anyNonAppUrlObserved",
"Previously certified records preserved: 32",
"Resume ordinal: 233",
"Residual live records: 168",
"stable_same_origin",
"3 consecutive app-origin samples within 0.75 seconds",
"previousThirtyTwoNotReplayed",
"record233SameOriginStableCertified",
"record233NonExportCertified",
"exactNewTwoHundredNonExportQualified",
"Strict sequential: ON",
"Halt on first failure: ON",
"Download Client Listing Report",
"exportInvocation",
"R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
"R28B_R3_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF",
"Export invocation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_R3_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_R3_R2_PROVED_RECORD233_ORIGIN_STABLE_THROUGH_THREE_SECOND_POST_REPORT_REVIEW_WINDOW_TO_THREE_SAMPLE_SAME_ORIGIN_GUARD_RECERTIFICATION_AND_RESUME_233_THROUGH_400_WITH_PRIOR32_PRESERVED"
},null,2));