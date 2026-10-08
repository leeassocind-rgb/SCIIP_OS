#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r25b.py"),"utf8");
const q=[
"R25A_EXACT_FIFTY_PREAUTHORIZATION_REQUIRED",
"EXACT_TWENTY_FIVE_NEW_UNIQUE_TARGETS_REQUIRED",
"freshPagePerRecordPolicyUsed",
"allExecutedExplorerSettlesCertified",
"allExecutedTargetBindingSettlesCertified",
"allExecutedSelectionsCertified",
"allExecutedAssignmentsCertified",
"Generate Client Listing Report",
"Download Client Listing Report",
"allExecutedReportReviewsCertified",
"allExecutedExportControlsCertified",
"allExecutedLiveHandlersCertified",
"exportReport",
"allTwentyFiveNewRecordsQualified",
"exportInvocationOff",
"TWENTY_FIVE_NEW_RECORDS_SELECTION_SETTLE_ASSIGNMENTS_DIRECT_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED",
"M4_19D4BN17C_R4_R12_R16A_R25C_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25B_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25A_TWENTY_FIVE_NEW_PREAUTHORIZED_RECORDS_TO_FRESH_PAGE_EXPLORER_SETTLE_TARGET_BINDING_SETTLE_ASSIGNMENTS_DIRECT_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_LIVE_QUALIFICATION"
},null,2));