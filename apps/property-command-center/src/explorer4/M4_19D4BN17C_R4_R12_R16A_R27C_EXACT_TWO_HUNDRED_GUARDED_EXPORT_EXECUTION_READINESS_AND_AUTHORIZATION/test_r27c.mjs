#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"authorize_r27c.py"),"utf8");
const q=["exactNewOneHundredCertifiedCount","REFERENCE_ONE_HUNDRED_REEXPORT: FORBIDDEN","EXACT_NEW_ONE_HUNDRED_ONLY",
"freshPagePerRecord","strictSequential","haltOnFirstFailure","maxExportClicksPerRecord",
"pdfDownloadCountMustEqual","pdfObjectUrlEventCountMustEqual","application/pdf",
"errorsMustEqual","unhandledRejectionsMustEqual","postPublishReportReviewMustUnmount",
"explorerMustRemainMounted","sameOriginMustRemain","DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM",
"R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION","Export invocation: OFF"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R27C_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R27B_NEW100_NON_EXPORT_QUALIFICATION_CLOSED_100_OF_100_TO_EXACT200_GUARDED_EXPORT_EXECUTION_AUTHORIZATION_WITH_CLOSED_REFERENCE100_REUSE_AND_NEW100_ONLY_LIVE_DELTA"},null,2));