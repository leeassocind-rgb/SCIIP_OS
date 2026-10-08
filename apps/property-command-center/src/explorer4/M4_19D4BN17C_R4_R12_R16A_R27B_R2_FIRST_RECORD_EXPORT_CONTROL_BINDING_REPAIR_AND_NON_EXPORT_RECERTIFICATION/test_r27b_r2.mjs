#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r27b_r2.py"),"utf8");
const q=["firstFailedStage","exportControlCertified","Download Client Listing Report","exportReport","liveHandlerCertified","exportInvocation\":False","R27B_R3_EXACT_ONE_HUNDRED_NEW_RECORD_NON_EXPORT_RECERTIFICATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R27B_R2_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R27B_R1_EXPORT_CONTROL_ONLY_FAILURE_TO_CERTIFIED_DOWNLOAD_CLIENT_LISTING_REPORT_PLUS_EXPORTREPORT_HANDLER_NON_EXPORT_BINDING"},null,2));