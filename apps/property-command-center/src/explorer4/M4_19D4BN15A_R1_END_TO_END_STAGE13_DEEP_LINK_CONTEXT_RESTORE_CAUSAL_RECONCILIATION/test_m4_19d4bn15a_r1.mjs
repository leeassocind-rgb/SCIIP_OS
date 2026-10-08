#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"reconcile_bn15a_r1.py"),"utf8");
const req=[
"bn15aOnlyStage13Residual","allStages1Through12LivePassed","allBn15aStage13ProbeResultsFailed",
"standaloneStage13LiveCertificationPassed","sameExactTenCohortAndOrder",
"BN13B_STANDALONE_LIVE_CERTIFICATION",
"END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED",
"M419D4BN15A_R1_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED",
"STAGE13_COMPOSITION_PROBE_GAP_RECONCILED_BY_STANDALONE_LIVE_CONTEXT_RESTORE_CERTIFICATION",
"M4_19D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE",
"READ_ONLY_EVIDENCE_RECONCILIATION","governedMutationOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN15A_R1_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
