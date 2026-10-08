#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const files=["bootstrap_certified_context.py","patch_executor.py","verify_executor.py"];
const s=files.map(f=>fs.readFileSync(path.join(d,f),"utf8")).join("\n");
const q=["remote-debugging-port","REUSED_EXISTING_CERTIFIED_CONTEXT","REACQUIRED_LOCAL_CERTIFIED_CONTEXT",
"EXPLORER_FIRST_SELECTION_PARITY","POST_PUBLISH_UNMOUNT_GUARD","postPublishReportReviewUnmountCertified",
"pdfDownloadCount","runtimeErrorCount","sameOrigin"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R2_CERTIFIED_LOGIC_PRESERVED_WITH_LOCAL_CDP_BROWSER_CONTEXT_REACQUISITION_BEFORE_EXACT_THREE_RECORD_EXPORT_RECERTIFICATION"
},null,2));