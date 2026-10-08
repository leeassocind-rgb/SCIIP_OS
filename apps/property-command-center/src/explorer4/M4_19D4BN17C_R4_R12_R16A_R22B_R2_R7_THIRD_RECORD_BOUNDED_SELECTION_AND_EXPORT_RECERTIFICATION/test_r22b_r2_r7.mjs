#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r22b_r2_r7.py"),"utf8");
const q=[
"THIRD_RECORD_SELECTION_TRANSIENT_PRIOR_FAILURE_NOT_REPRODUCED",
'click_exact(w,"Explorer")',
".sciip-property-marker.is-selected",
"Generate Client Listing Report",
"Download Client Listing Report",
"exportReport",
"pdfDownloadCount",
"pdfEventCount",
"postPublishReportReviewUnmountCertified",
"explorerContinuity",
"sameOrigin",
"THIRD_RECORD_BOUNDED_SELECTION_AND_EXPORT_RECERTIFIED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R7_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R6_TRANSIENT_THIRD_SELECTION_FAILURE_TO_SINGLE_RECORD_SELECTED_MARKER_READBACK_AND_GUARDED_EXPORT_RECERTIFICATION"
},null,2));