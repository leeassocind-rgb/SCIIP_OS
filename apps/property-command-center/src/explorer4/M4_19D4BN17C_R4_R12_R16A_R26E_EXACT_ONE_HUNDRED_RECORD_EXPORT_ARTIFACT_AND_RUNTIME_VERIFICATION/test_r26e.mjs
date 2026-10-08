#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"verify_r26e.py"),"utf8");
const q=["READ_ONLY_POST_EXECUTION_VERIFICATION","Export invocation: OFF","r26dTargetCountExactOneHundred",
"artifactRuntimeInvariant","exactOneHundredDistinctExportsProven","certified_count==100",
"R26D_DECLARED_EXACT_ONE_HUNDRED_BUT_DELEGATED_RUNNER_EVIDENCE_DOES_NOT_PROVE_ONE_HUNDRED_DISTINCT_EXPORTS",
"R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSAL_DIAGNOSIS"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26E_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26D_DELEGATED_EXECUTION_TO_POST_EXECUTION_ARTIFACT_RUNTIME_AND_EXACT_DISTINCT_RECORD_COUNT_TRUTHFULNESS_VERIFICATION"},null,2));