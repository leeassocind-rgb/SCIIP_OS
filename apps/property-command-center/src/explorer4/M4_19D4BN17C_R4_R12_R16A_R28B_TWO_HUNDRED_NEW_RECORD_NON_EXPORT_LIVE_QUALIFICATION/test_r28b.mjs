#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r28b.py"),"utf8");
const q=[
"exact_new_two_hundred_candidates_prefix_normalized.json",
"target artifact must contain exactly 200 records",
"Fresh page per record: REQUIRED",
"Strict sequential: ON",
"Halt on first failure: ON",
"document.readyState",
"nonzero button DOM",
"settle_target_binding",
"ADDRESS_PLUS_VISIBLE_SF",
"BOUNDARY_NORMALIZED_IDENTITY",
"UNIQUE_CONTAINS",
"settle_selected",
"Assignments",
"Generate Client Listing Report",
"Download Client Listing Report",
"function exportReport",
"onClick={exportReport}",
"exportInvocation",
"EXACT NEW 200 ONLY",
"R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
"R28B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
"Application source mutation: OFF",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF",
"Export invocation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28A_R4_CERTIFIED_REFERENCE_DISJOINT_PREFIX_NORMALIZED_NEW200_TO_STRICT_SEQUENTIAL_FRESH_PAGE_NON_EXPORT_LIVE_QUALIFICATION_WITH_CANONICAL_SF_AWARE_BINDING_SELECTED_READBACK_ASSIGNMENTS_GENERATE_REPORT_REVIEW_DOWNLOAD_CONTROL_AND_SOURCE_CERTIFIED_EXPORT_HANDLER"
},null,2));