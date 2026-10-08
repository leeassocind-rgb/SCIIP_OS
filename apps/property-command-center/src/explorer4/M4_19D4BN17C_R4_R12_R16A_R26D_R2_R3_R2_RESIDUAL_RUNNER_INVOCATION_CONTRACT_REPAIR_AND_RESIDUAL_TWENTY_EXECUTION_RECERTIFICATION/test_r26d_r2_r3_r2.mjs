#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"execute_r26d_r2_r3_r2.py"),"utf8");
const q=[
'str(exec_runner),str(repo),str(residual_file)',
'runnerInvocationReceivesRepoAndTargetFile',
'executionSummary',
'residualDiagnosisOrdinal81Consumed',
'residualDiagnosisTargetAlondraConsumed',
'targets[30:]',
'Residual live records: 20',
'Resume ordinal: 81',
'MAX_EXPORT_CLICKS_PER_RECORD=1',
'STRICT_SEQUENTIAL=True',
'HALT_ON_FIRST_FAILURE=True',
'SCIIP_R26D_R2_R3_LIVE_EXPORT_AUTHORIZED',
'referenceFiftyNotReexported',
'previousThirtyNotReexported'
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
if(s.includes('str(exec_runner),str(residual_file)]')){console.error("FAIL stale one-argument runner invocation");process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R3_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length+1,
 repair:"R26D_R2_R3_R1_RESIDUAL_EXECUTION_BLOCKED_BY_MISSING_REPO_ARGUMENT_TO_NATIVE_RUNNER_TO_EXACT_TWO_ARGUMENT_RUNNER_INVOCATION_WITH_UNCHANGED_RESIDUAL20_COHORT_AND_GUARDS"
},null,2));