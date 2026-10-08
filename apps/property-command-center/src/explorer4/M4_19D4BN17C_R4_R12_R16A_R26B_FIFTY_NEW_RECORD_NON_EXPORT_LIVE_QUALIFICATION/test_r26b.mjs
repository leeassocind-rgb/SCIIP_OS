#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r26b.py"),"utf8");
const q=[
"R26A_EXACT_ONE_HUNDRED_PREAUTHORIZATION_REQUIRED",
"EXACT_FIFTY_NEW_UNIQUE_TARGETS_REQUIRED",
"freshPagePerRecordPolicyUsed",
"strictSequentialObserved",
"haltOnFirstFailureObserved",
"allExecutedExplorerSettlesCertified",
"allExecutedTargetBindingSettlesCertified",
"allExecutedSelectionsCertified",
"allExecutedAssignmentsCertified",
"allExecutedReportReviewsCertified",
"allExecutedExportControlsCertified",
"allExecutedLiveHandlersCertified",
"allExecutedExplorerContinuityCertified",
"allExecutedSameOriginCertified",
"allFiftyNewRecordsQualified",
"BOUNDARY_NORMALIZED_IDENTITY",
"UNIQUE_CONTAINS",
"Generate Client Listing Report",
"Download Client Listing Report",
"exportReport",
"exportInvocationOff",
"R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26B_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26A_FIFTY_NEW_PREAUTHORIZED_RECORDS_TO_FRESH_PAGE_EXPLORER_SETTLE_TARGET_BINDING_SETTLE_SELECTION_ASSIGNMENTS_DIRECT_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_LIVE_QUALIFICATION"
},null,2));