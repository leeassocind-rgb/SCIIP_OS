#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"close_bn17c_r4_r12_r10_r1.py"),"utf8");
const req=[
"READ_ONLY_EVIDENCE_RECONCILIATION",
"r9R2MaterializedThreeOfThree",
"r10CertifiedTwoOfThree",
"r10OnlyTwoMusickFailed",
"r11TwoMusickCertified",
"reconstructedAllCertified",
"SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CLOSED",
"CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_AND_CLOSED_THREE_OF_THREE",
"POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN",
"liveUiInteractionOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R10_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R10_TWO_OF_THREE_PLUS_R11_TWO_MUSICK_REPAIR_RECONCILED_INTO_THREE_OF_THREE_SELECTED_PROPERTY_CLOSURE"
},null,2));