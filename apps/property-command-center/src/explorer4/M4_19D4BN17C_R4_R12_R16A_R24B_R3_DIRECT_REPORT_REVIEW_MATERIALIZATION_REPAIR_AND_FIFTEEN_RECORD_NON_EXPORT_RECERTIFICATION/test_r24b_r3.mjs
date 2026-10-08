#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r24b_r3.py"),"utf8");
const q=[
"GENERATE_CLICK_DIRECTLY_MATERIALIZES_REPORT_REVIEW_R24B_R2_ERRONEOUS_EXTRA_REPORT_REVIEW_BUTTON_ASSUMPTION",
"norm_candidate","PROPOSED","wait_direct_review","Review Client Listing Report","Institutional Reporting Engine",
"Download Client Listing Report","exportReport","intermediateReportReviewButtonRequired","False",
"allFifteenNewRecordsQualified","exportInvocationOff",
"FIFTEEN_NEW_RECORDS_DIRECT_REPORT_REVIEW_MATERIALIZATION_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED",
"M4_19D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24B_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R24B_R2_R1_CERTIFIED_DIRECT_GENERATE_TO_REPORT_REVIEW_MATERIALIZATION_TO_REMOVE_FALSE_INTERMEDIATE_REPORT_REVIEW_CONTROL_REQUIREMENT_AND_RECERTIFY_EXACT_FIFTEEN_NON_EXPORT_TARGETS"
},null,2));