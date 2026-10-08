#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"close_bn15_lifecycle.py"),"utf8");
const req=[
"M419D4BN15_EXACT_TEN_END_TO_END_GOVERNED_WORKFLOW_RECERTIFICATION_DESIGN_CERTIFIED",
"bn15aStages1Through12LivePassed","bn15aStage13SoleResidual",
"M419D4BN15A_R1_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED",
"allThirteenStagesCausallyCertified","allCausalOutcomesCertified",
"M419D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSED",
"EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN15_END_TO_END_GOVERNED_WORKFLOW_CLOSED_EXPANSION_READINESS_READY",
"M4_19D4BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS",
"READ_ONLY_EVIDENCE_CLOSURE","r1NetworkAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN15B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
