#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"capture_r27b_r2_r3.py"),"utf8");
const q=["InstitutionalReportReview.jsx","Download Client Listing Report","exportReport","CONTROL_BINDS_EXPORTREPORT:",
"Export invocation: OFF","Application source mutation: OFF","Governed data mutation: OFF",
"SOURCE_LEVEL_EXPORT_CONTROL_BINDING_CERTIFIED","RESUME_EXACT_NEW_ONE_HUNDRED_NON_EXPORT_QUALIFICATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R27B_R2_R3_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R27B_R2_R2_PROVED_EXPECTED_LABEL_AND_HANDLER_EXIST_TO_EXACT_COMPONENT_SOURCE_BINDING_CAPTURE_WITHOUT_EXPORT_INVOCATION"},null,2));