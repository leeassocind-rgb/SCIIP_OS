#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"close_r27e.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION_AND_LIFECYCLE_CLOSURE",
"Export invocation: OFF",
"Reference re-export: FORBIDDEN",
"exact_new_one_hundred_guarded_live_export_execution.json",
"certifiedCount",
"pdfDownloadCount",
"pdfObjectUrlEventCount",
"application/pdf",
"runtimeErrorCount",
"unhandledRejectionCount",
"postPublishReportReviewUnmountCertified",
"explorerContinuity",
"sameOrigin",
"list(range(101,201))",
"referenceClosedCount",
"referenceOneHundredNotReexported",
"exactCombinedCertifiedCount",
"newCohortArtifactEvidenceSha256",
"R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY",
"R27E_R1_EXACT_TWO_HUNDRED_CLOSURE_RESIDUAL_DIAGNOSIS"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27E_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27D_NEW100_LIVE_EXPORT_100_OF_100_TO_EXACT200_READ_ONLY_ARTIFACT_RUNTIME_RECONCILIATION_PROGRESSIVE_LIFECYCLE_CLOSURE"
},null,2));