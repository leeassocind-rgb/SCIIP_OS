#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"authorize_r23c.py"),"utf8");
const q=[
"REFERENCE_CERTIFIED_RECORDS",
"NEW_QUALIFIED_RECORDS",
"EXACT_TEN_COHORT_SIZE",
"liveExportExecutionAuthorized",
"EXACT_TEN_RECORD_COHORT_ONLY",
"requiredConsecutiveCertifiedSamples",
"maximumSettleWindowSeconds",
"liveHandlerMustEqual",
"maximumExportClicksPerRecord",
"exactOnePdfDownloadRequired",
"postPublishReportReviewUnmountRequired",
"strictSequential",
"haltOnFirstFailure",
"exportInvocationOffInThisMilestone",
"REFERENCE_THREE_CLOSED_PLUS_SEVEN_NEW_QUALIFIED_EXACT_TEN_GUARDED_EXPORT_EXECUTION_AUTHORIZED",
"M4_19D4BN17C_R4_R12_R16A_R23D_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23C_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22C_R1_REFERENCE_THREE_CLOSED_PLUS_R23B_SEVEN_NEW_QUALIFIED_TO_EXACT_TEN_GUARDED_EXPORT_EXECUTION_AUTHORIZATION"
},null,2));