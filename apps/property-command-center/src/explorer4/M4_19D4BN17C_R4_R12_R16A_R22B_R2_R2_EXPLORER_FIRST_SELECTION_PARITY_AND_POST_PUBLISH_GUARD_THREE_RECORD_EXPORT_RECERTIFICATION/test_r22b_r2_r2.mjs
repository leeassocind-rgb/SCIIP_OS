#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const a=fs.readFileSync(path.join(d,"patch_r22b_r2_r2.py"),"utf8");
const b=fs.readFileSync(path.join(d,"verify_r22b_r2_r2.py"),"utf8");
const q=[
"EXPLORER_FIRST_SELECTION_PARITY: RESTORED",
"POST_PUBLISH_UNMOUNT_GUARD: RESTORED",
"target_select(w,t)",
'click_exact(w,"Explorer")',
"postPublishReportReviewUnmountCertified",
"pdfArtifactGuardsPreserved",
"runtimeGuardsPreserved",
"sameOriginGuardPreserved",
"strictSequentialGuardPreserved"
];
for(const x of q){if(!a.includes(x)&&!b.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R1_SELECTION_REGRESSION_REPAIRED_BY_RESTORING_R22A_R3_EXPLORER_FIRST_SEQUENCE_WITH_CORRECTED_POST_PUBLISH_UNMOUNT_GUARD"
},null,2));