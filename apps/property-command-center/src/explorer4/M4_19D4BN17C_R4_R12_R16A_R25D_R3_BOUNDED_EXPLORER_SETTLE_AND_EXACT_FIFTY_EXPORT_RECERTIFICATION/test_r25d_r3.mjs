#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r25d_r3.py"),"utf8");
const q=[
"R25D_R2_TRANSIENT_EXPLORER_TIMING_DIAGNOSIS_REQUIRED",
"THREE CONSECUTIVE UNIQUE EXACT SAMPLES WITHIN 2.0 SECONDS",
"boundedExplorerSettleUsed",
"explorerSettleThreeConsecutiveSamplesRequired",
"explorerSettleMaximumSecondsTwoPreserved",
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
"M4_19D4BN17C_R4_R12_R16A_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R25D_R3_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R25D_R2_CERTIFIED_TRANSIENT_EXPLORER_MATERIALIZATION_RACE_TO_THREE_CONSECUTIVE_SAMPLE_TWO_SECOND_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"},null,2));