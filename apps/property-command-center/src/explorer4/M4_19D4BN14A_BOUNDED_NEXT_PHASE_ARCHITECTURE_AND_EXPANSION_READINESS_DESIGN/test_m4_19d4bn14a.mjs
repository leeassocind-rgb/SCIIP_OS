#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn14a.py"),"utf8");
const req=[
"M419D4BN14_R1_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_CERTIFIED",
"allSixConsumerFamiliesClosed",
"noMutationAuthorityReconciled",
"EXACT_TEN_END_TO_END_WORKFLOW_RECERTIFICATION",
"BOUNDED_COHORT_EXPANSION",
"GOVERNED_MUTATION_REINTRODUCTION_DESIGN",
"readOnlyNextPhasePreferred",
"M419D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_CERTIFIED",
"POST_CONSUMER_FAMILY_END_TO_END_RECERTIFICATION_SELECTED_AS_NEXT_BOUNDED_PHASE",
"M4_19D4BN15_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_DESIGN",
"applicationSourceMutation",
"governedDataMutation"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN14A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
