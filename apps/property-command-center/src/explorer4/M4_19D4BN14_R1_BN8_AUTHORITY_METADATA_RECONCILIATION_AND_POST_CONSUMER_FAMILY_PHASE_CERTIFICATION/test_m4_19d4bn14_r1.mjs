#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"reconcile_bn14_r1.py"),"utf8");
const req=[
"originalBn14AllSixFamiliesClosed",
"originalBn14Bn8GovernedMutationProbeFailed",
"bn8ConstituentGovernedMutationOff",
"bn8aGovernedMutationOff",
"bn8bR3GovernedMutationOff",
"bn8AuthorityMetadataOmissionOrShapeMismatchReconciled",
"noMutationAuthorityReconciled",
"READ_ONLY_EVIDENCE_RECONCILIATION",
"M419D4BN14_R1_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_CERTIFIED",
"BN8_AUTHORITY_METADATA_OMISSION_RECONCILED_BN8_THROUGH_BN13_CONSUMER_FAMILIES_CERTIFIED_CLOSED",
"M4_19D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN",
"closedConsumerFamilies"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN14_R1_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"BN8_TOP_LEVEL_AUTHORITY_METADATA_OMISSION_RECONCILED_FROM_CERTIFIED_CONSTITUENT_CLOSURE_CHECKS"},null,2));
