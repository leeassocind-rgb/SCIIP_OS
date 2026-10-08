#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r27b_r3_r1.py"),"utf8");
const q=["READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS","exact_one_hundred_new_record_non_export_recertification.json","exportControlCertified","liveHandlerCertifiedBySourceContract","FIRST_FAILED_STAGE","noRetryPerformed","Live UI interaction: OFF","Export invocation: OFF","R27B_R3_R2_FIRST_RECORD_LIVE_CONTROL_SURFACE_CAUSAL_REPAIR"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R27B_R3_R1_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R27B_R3_HALTED_AT_RECORD101_TO_READ_ONLY_EXACT_STAGE_DIAGNOSIS_WITHOUT_RETRY"},null,2));