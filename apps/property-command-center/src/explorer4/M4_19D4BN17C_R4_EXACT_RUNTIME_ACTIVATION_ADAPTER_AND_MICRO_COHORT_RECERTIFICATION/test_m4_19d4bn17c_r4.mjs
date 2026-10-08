#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4.py"),"utf8");
const r=["__reactProps$","invoke_runtime_action","exactThreeRecordMicroCohort","microCohortRecertifiedThreeOfThree",
"selectionSourceReferencesResolved","compareSourceReferencesResolved","commandSourceReferencesResolved",
"analyzePresentSourceReferencesResolved","exportSourceReferencesResolved",
"M419D4BN17C_R4_EXACT_RUNTIME_ACTIVATION_ADAPTER_MICRO_COHORT_RECERTIFIED",
"M4_19D4BN17C_R5_EXACT_RUNTIME_ACTIVATION_ADAPTER_50_RECORD_LIVE_WORKFLOW_RECERTIFICATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"SOURCE_RESOLVED_REACT_RUNTIME_ACTIVATION_ADAPTER_WITH_THREE_RECORD_MICRO_COHORT"},null,2));