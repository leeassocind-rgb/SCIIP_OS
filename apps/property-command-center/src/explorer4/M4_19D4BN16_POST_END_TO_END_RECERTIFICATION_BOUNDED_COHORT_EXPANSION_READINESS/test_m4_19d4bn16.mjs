#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"design_bn16.py"),"utf8");
const req=["M419D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSED",
"EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CERTIFIED_AND_CLOSED",
"nextCohortCeiling",'"referenceCohortSize":10','"nextCohortCeiling":25',
"DETERMINISTIC","referenceCohortMustRemainIncluded","READ_ONLY_CERTIFICATION",
"mutationAuthorityGranted","M419D4BN16_BOUNDED_COHORT_EXPANSION_READINESS_CERTIFIED",
"M4_19D4BN16A_25_RECORD_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION","haltOnFirstFailure"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
