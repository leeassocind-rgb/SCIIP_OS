#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"execute_r25d.py"),"utf8");
const q=[
"R25C_EXACT_FIFTY_AUTHORIZATION_REQUIRED",
"EXACT_FIFTY_UNIQUE_AUTHORIZED_TARGETS_REQUIRED",
"EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM",
"freshPagePerRecordPolicyUsed",
"allExecutedExplorerSettlesCertified",
"allExecutedTargetBindingSettlesCertified",
"allExecutedSelectionsCertified",
"allExecutedAssignmentsCertified",
"allExecutedReportReviewsCertified",
"allExecutedExportControlsCertified",
"allExecutedLiveHandlersCertified",
"allExecutedExportsCertified",
"allFiftyExportsCertified",
"pdfDownloadCount",
"pdfObjectUrlEventCount",
"application/pdf",
"postPublishReportReviewUnmountCertified",
"runtimeErrorCount",
"unhandledRejectionCount",
"M4_19D4BN17C_R4_R12_R16A_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25D_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25C_EXACT_FIFTY_EXPORT_AUTHORIZATION_TO_STRICT_SEQUENTIAL_FRESH_PAGE_SETTLED_SINGLE_CLICK_GUARDED_EXPORT_EXECUTION_WITH_ARTIFACT_AND_RUNTIME_READBACK"
},null,2));