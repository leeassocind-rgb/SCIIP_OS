#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"execute_r26d.py"),"utf8");
const q=["R26C authorization evidence missing","EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM","Fresh page per record: REQUIRED",
"Strict sequential: ON","Halt on first failure: ON","SCIIP_EXACT_COHORT_FILE","SCIIP_EXPORT_COHORT_SIZE","100",
"SCIIP_EXPORT_MAX_CLICKS_PER_RECORD","certified R25D-R3 live execution runner","refusing to invent an unproven Export driver",
"R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26D_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26C_AUTHORIZED_EXACT_ONE_HUNDRED_TO_GUARDED_LIVE_EXPORT_EXECUTION_BY_REUSE_OF_CERTIFIED_R25D_R3_BROWSER_DRIVER"},null,2));