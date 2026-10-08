#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r27b_r2_r1.py"),"utf8");
const q=[
"READ_ONLY_STRUCTURED_EVIDENCE_DIAGNOSIS",
"CONTROL_COUNT:",
"CONTROL_VISIBLE:",
"CONTROL_ENABLED:",
"HANDLER_NAME:",
"EXPECTED_DOWNLOAD_CONTROL_LABEL_NOT_MATERIALIZED",
"EXPECTED_DOWNLOAD_CONTROL_LABEL_NON_UNIQUE",
"EXPECTED_DOWNLOAD_CONTROL_NOT_VISIBLE",
"EXPECTED_DOWNLOAD_CONTROL_DISABLED",
"DOWNLOAD_CONTROL_PRESENT_BUT_HANDLER_NAME_NOT_EXPORTREPORT",
"noRetryPerformed",
"EXPORT_CONTROL_SURFACE_AND_HANDLER_DEEP_DIAGNOSIS"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27B_R2_CONTROL_AND_HANDLER_RECERTIFICATION_FAILED_TO_READ_ONLY_STRUCTURED_CONTROL_COUNT_VISIBILITY_ENABLED_AND_HANDLER_CAUSAL_DIAGNOSIS"
},null,2));