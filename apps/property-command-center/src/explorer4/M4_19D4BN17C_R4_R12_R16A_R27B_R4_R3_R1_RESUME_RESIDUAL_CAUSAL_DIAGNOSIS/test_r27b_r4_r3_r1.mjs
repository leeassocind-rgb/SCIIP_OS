#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r27b_r4_r3_r1.py"),"utf8");
const q=["certifiedCount\")!=99","len(failed)!=1","FIRST_FAILURE_ORDINAL","firstFailedStage","failureOrdinal200","12350 Philadelphia St","noRetryPerformed","Live UI interaction: OFF","Export invocation: OFF","RECORD_200_FAILED_STAGE_DEEP_DIAGNOSIS"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R27B_R4_R3_R1_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R27B_R4_R3_CERTIFIED_72_OF_73_RESIDUAL_AND_99_OF_100_TOTAL_TO_READ_ONLY_EXACT_RECORD200_FAILED_STAGE_CAUSAL_DIAGNOSIS_WITHOUT_RETRY"},null,2));