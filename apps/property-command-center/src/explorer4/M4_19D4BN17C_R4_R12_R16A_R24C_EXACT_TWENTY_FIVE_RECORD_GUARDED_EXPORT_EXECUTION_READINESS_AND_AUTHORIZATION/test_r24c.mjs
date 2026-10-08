#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"authorize_r24c.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION_AND_AUTHORIZATION",
"R23F_REFERENCE_TEN_LIFECYCLE_CLOSURE_REQUIRED",
"R24A_EXACT_TWENTY_FIVE_PREAUTHORIZATION_REQUIRED",
"R24B_R3_FIFTEEN_NEW_NON_EXPORT_QUALIFICATION_REQUIRED",
"REFERENCE_TEN_CLOSED_PLUS_FIFTEEN_NEW_QUALIFIED_EXACT_TWENTY_FIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZED",
"authorizationBoundedToExactTwentyFive",
"candidateStatusSuffixNormalizationRequired",
"directGenerateToReportReviewMaterializationRequired",
"freshPagePerRecordRequired",
"targetBindingSettleMaximumSecondsFive",
"selectedPropertySettleMaximumSecondsTwo",
"oneExportClickMaximumPerRecord",
"singlePdfDownloadRequired",
"singlePdfObjectUrlEventRequired",
"pdfMimeApplicationPdfRequired",
"positivePdfSizeRequired",
"postPublishUnmountRequired",
"runtimeContinuityGuardRequired",
"sameOriginRequired",
"exportInvocationOffInThisMilestone",
"M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24C_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23F_REFERENCE_TEN_CLOSED_PLUS_R24A_EXACT_TWENTY_FIVE_PREAUTHORIZED_PLUS_R24B_R3_FIFTEEN_NEW_QUALIFIED_TO_EXACT_TWENTY_FIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZATION"
},null,2));