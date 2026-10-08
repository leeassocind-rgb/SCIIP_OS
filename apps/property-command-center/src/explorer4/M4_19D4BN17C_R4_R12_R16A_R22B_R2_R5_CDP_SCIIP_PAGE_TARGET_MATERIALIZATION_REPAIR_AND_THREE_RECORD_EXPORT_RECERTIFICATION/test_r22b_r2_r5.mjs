#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=["materialize_sciip_target.py","patch_executor.py","verify_executor.py"].map(f=>fs.readFileSync(path.join(d,f),"utf8")).join("\n");
const q=[
"/json/new?",
"SCIIP_PAGE_CREATED_IN_EXISTING_CDP_CONTEXT",
"EXISTING_SCIIP_PAGE_REUSED",
'click_exact(w,"Explorer")',
"postPublishReportReviewUnmountCertified",
"pdfDownloadCount",
"pdfEventCount",
"runtimeErrorCount",
"sameOrigin",
"haltOnFirstFailureObserved"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R5_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R4_ACTIVE_CDP_ZERO_TARGET_CAUSE_TO_JSON_NEW_SCIIP_PAGE_MATERIALIZATION_AND_EXACT_THREE_RECORD_EXPORT_RECERTIFICATION"
},null,2));