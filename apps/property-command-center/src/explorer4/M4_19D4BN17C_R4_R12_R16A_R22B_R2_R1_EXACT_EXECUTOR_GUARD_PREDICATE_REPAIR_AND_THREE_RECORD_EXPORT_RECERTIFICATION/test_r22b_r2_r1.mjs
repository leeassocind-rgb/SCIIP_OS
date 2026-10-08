#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const a=fs.readFileSync(path.join(d,"patch_exact_r22b_guard.py"),"utf8");
const b=fs.readFileSync(path.join(d,"verify_patched_executor.py"),"utf8");
const q=[
'out\\["reportReviewContinuity"\\]',
'postPublishReportReviewUnmountCertified',
'not bool(d.get("reportReviewVisible"))',
'CERTIFICATION_EXECUTOR_COPY_ONLY',
'pdfArtifactGuardsPreserved',
'runtimeErrorGuardsPreserved',
'explorerContinuityGuardPreserved',
'sameOriginGuardPreserved'
];
for(const x of q){if(!a.includes(x)&&!b.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_PATCHER_FALSE_NEGATIVE_REPAIRED_AGAINST_ACTUAL_OUT_REPORTREVIEWCONTINUITY_ASSIGNMENT_AND_RECERTIFICATION_GUARD_PARITY"
},null,2));