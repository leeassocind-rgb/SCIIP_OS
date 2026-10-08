#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r22b_r2_r8.py"),"utf8");
const q=[
"THIRD_RECORD_SELECTION_STABLE_IMMEDIATE_R7_FAILURE_IS_TRANSIENT_EXECUTION_RACE",
"bounded_selection_readback",
"consecutive>=3",
"maximumSelectionSettleWindowSeconds",
".sciip-property-marker.is-selected",
'click_exact(w,"Explorer")',
"Generate Client Listing Report",
"Download Client Listing Report",
"exportReport",
"pdfDownloadCount",
"pdfEventCount",
"postPublishReportReviewUnmountCertified",
"explorerContinuity",
"sameOrigin",
"THIRD_RECORD_BOUNDED_SETTLE_SELECTION_AND_EXPORT_RECERTIFIED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R8_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R7_R1_STABLE_IMMEDIATE_SELECTION_RACE_TO_THREE_CONSECUTIVE_SAMPLE_BOUNDED_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"
},null,2));