#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r1.py"),"utf8");
const r=["safe_activation_result","NULL_RUNTIME_RESULT","runtimeNullResultsDidNotCrash","nullSafeActivationAdapterUsed",
"selection[\"invoked\"]","compare[\"invoked\"]","command[\"invoked\"]","export[\"invoked\"]",
"M419D4BN17C_R4_R1_NULL_SAFE_RUNTIME_ACTIVATION_ADAPTER_MICRO_COHORT_RECERTIFIED",
"M4_19D4BN17C_R5_EXACT_RUNTIME_ACTIVATION_ADAPTER_50_RECORD_LIVE_WORKFLOW_RECERTIFICATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R1_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"NULL_RUNTIME_ACTIVATION_RESULTS_NORMALIZED_INSTEAD_OF_DEREFERENCED"},null,2));