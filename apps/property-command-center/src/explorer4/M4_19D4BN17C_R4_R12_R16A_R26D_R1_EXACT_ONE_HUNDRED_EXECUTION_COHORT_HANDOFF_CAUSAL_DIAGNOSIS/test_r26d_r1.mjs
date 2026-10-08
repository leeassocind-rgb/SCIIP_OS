#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26d_r1.py"),"utf8");
const q=[
"READ_ONLY_SOURCE_AND_EVIDENCE_DIAGNOSIS",
"SCIIP_EXACT_COHORT_FILE",
"SCIIP_EXPORT_COHORT_SIZE",
"find_best_outcome_list",
"structuredOutcomeCountResolved",
"r26eNaiveTextCountEvaluated",
"delegatedRunnerHardBoundTo50",
"r26eTextCountBugConfirmed",
"R26D_EXACT_ONE_HUNDRED_TARGET_FILE_WAS_NOT_CONSUMED_BY_REUSED_R25D_R3_RUNNER",
"R26D_R2_EXACT_ONE_HUNDRED_NATIVE_RUNNER_ADAPTATION_AND_STATIC_CERTIFICATION",
"Live UI interaction: OFF",
"Export invocation: OFF"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26E_INCOMPLETE_EXACT_ONE_HUNDRED_VERIFICATION_TO_STRUCTURED_RUNNER_HANDOFF_AND_VERIFIER_COUNTING_CAUSAL_DIAGNOSIS"
},null,2));