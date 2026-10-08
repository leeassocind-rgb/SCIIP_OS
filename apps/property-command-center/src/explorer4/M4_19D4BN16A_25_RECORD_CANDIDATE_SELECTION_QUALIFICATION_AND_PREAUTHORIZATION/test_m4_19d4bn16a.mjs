#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"select_bn16a.py"),"utf8");
const req=[
"M419D4BN16_BOUNDED_COHORT_EXPANSION_READINESS_CERTIFIED",
"referenceCohortSizeTen","nextCohortCeilingTwentyFive","deterministicSelectionRequired",
"exactlyFifteenNewCandidatesSelected","exactlyTwentyFiveTotal","originalTenRemainFirstAndUnchanged",
"allTwentyFiveUnique","selectionDeterministic","NORMALIZED_LABEL_ASCENDING",
"M419D4BN16A_25_RECORD_COHORT_SELECTION_QUALIFICATION_PREAUTHORIZED",
"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
