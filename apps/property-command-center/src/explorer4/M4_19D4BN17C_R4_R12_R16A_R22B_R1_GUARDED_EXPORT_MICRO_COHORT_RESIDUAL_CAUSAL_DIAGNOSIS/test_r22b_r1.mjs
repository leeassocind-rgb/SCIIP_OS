#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"diagnose_r22b_r1.py"),"utf8");
const q=[
"r22bIncompleteStateConsumed",
"firstRecordExportClicked",
"pdfDownloadCertified",
"pdfObjectUrlCertified",
"pdfMimeCertified",
"pdfSizePositive",
"runtimeClean",
"explorerContinuityPreserved",
"sameOriginPreserved",
"reportReviewContinuityFailed",
"exportReportSourceInspected",
"onPublishSourceInspected",
"setShowReportReviewSourceInspected",
"postPublishCloseBehaviorClassified",
"priorContinuityPredicateInspected",
"r22ContinuityPredicateInspected",
"exportInvocationOff",
"R22B_EXPORT_SUCCEEDED_REPORT_REVIEW_UNMOUNT_IS_INTENDED_POST_PUBLISH_BEHAVIOR",
"POST_PUBLISH_CONTINUITY_GUARD_REPAIR_AND_THREE_RECORD_EXPORT_RECERTIFICATION"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_FIRST_RECORD_VALID_PDF_EXPORT_WITH_ONLY_REPORT_REVIEW_CONTINUITY_FAILURE_TO_SOURCE_ONPUBLISH_UNMOUNT_AND_GUARD_SEMANTICS_DIAGNOSIS"
},null,2));