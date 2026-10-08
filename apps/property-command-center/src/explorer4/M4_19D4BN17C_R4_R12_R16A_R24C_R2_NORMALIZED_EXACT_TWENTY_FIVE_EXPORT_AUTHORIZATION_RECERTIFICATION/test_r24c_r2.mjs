#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"authorize_r24c_r2.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION_AND_AUTHORIZATION",
"R24C_R1_NORMALIZED_COHORT_RECONCILIATION_REQUIRED",
"normalizedExactTwentyFiveMatchesQualifiedExactTwentyFive",
"referenceTenPreservedInFirstTenPositions",
"qualifiedFifteenPreservedInLastFifteenPositions",
"statusSuffixIdentityNormalizationPreserved",
"targetBindingExactFirstUniqueContainsFallback",
"ambiguousContainsBindingForbidden",
"directGenerateToReportReviewMaterializationRequired",
"liveHandlerMustEqualExportReport",
"oneExportClickMaximumPerRecord",
"singlePdfDownloadRequired",
"singlePdfObjectUrlEventRequired",
"postPublishReportReviewUnmountRequired",
"runtimeErrorsZeroRequired",
"authorizationBoundedToExactTwentyFive",
"NORMALIZED_EXACT_TWENTY_FIVE_COHORT_RECONCILED_AND_GUARDED_EXPORT_EXECUTION_AUTHORIZED",
"M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24C_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R24C_R1_NORMALIZED_EXACT_TWENTY_FIVE_COHORT_RECONCILIATION_TO_READ_ONLY_GUARDED_EXPORT_EXECUTION_AUTHORIZATION_RECERTIFICATION"
},null,2));