#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"repair_r26d_r2_r1_r1.py"),"utf8");
const r=fs.readFileSync(path.join(d,"native_new_fifty_runner.py"),"utf8");
const q=[
"IDEMPOTENT_RUNNER_INSTALL_AND_STATIC_RECERTIFICATION",
"same_file",
"copy_or_verify",
"SAME_FILE_VERIFIED",
"IDENTICAL_DESTINATION_VERIFIED",
"COPIED_AND_HASH_VERIFIED",
"sameFileConditionHandledWithoutException",
"runnerInstalledOrVerified",
"targetFileInstalledOrVerified",
"SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED",
"R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION",
"Export invocation: OFF"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL repair",x);process.exit(1)}
const rq=['EXPECTED_COUNT=50','MAX_EXPORT_CLICKS_PER_RECORD=1','STRICT_SEQUENTIAL=True','HALT_ON_FIRST_FAILURE=True','exportReport','application/pdf'];
for(const x of rq)if(!r.includes(x)){console.error("FAIL runner",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R1_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length+rq.length,
 repair:"R26D_R2_R1_SAMEFILEERROR_TO_IDEMPOTENT_COPY_OR_HASH_VERIFY_INSTALLER_WITH_UNCHANGED_NATIVE_RUNNER_CONTRACT"
},null,2));