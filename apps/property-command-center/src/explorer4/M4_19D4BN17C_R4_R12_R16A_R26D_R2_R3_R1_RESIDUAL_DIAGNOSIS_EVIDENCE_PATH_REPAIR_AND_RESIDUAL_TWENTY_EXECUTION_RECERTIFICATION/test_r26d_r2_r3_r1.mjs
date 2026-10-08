#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"execute_r26d_r2_r3_r1.py"),"utf8");
const q=[
'executionSummary',
'diag_summary.get("firstFailureOrdinal"',
'diag_summary.get("firstFailureTarget"',
'residualDiagnosisOrdinal81Consumed',
'residualDiagnosisTargetAlondraConsumed',
'targets[30:]',
'Reference closed records: 50',
'Previously certified new records: 30',
'Residual live records: 20',
'MAX_EXPORT_CLICKS_PER_RECORD=1',
'STRICT_SEQUENTIAL=True',
'HALT_ON_FIRST_FAILURE=True',
'SCIIP_R26D_R2_R3_LIVE_EXPORT_AUTHORIZED'
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R3_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26D_R2_R3_BLOCKED_BY_TOP_LEVEL_DIAGNOSIS_FIELD_LOOKUP_TO_NESTED_EXECUTION_SUMMARY_ORDINAL_AND_TARGET_CONSUMPTION_WITH_UNCHANGED_RESIDUAL20_EXECUTION_CONTRACT"
},null,2));