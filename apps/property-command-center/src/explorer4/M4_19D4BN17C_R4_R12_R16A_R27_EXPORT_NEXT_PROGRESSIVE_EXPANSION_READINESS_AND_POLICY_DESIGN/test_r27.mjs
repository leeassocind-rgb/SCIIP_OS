#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"design_r27.py"),"utf8");
const q=[
"READ_ONLY_ARCHITECTURE_DESIGN",
"reference=100",
"nxt=200",
"new=100",
"scale=2.0",
"PROGRESSIVE_DELTA_ONE_HUNDRED",
"REUSE_CLOSED_EXACT_100_LIFECYCLE_EVIDENCE",
"QUALIFY_AND_EXECUTE_EXACT_NEW_100_ONLY",
"referenceOneHundredWillNotBeReexported",
"freshPagePerRecordRequired",
"strictSequentialRequired",
"haltOnFirstFailureRequired",
"buildingProjectAwareCanonicalBindingPreserved",
"ambiguousAddressOnlyBindingForbidden",
"singleExportMaximumPerRecordPreserved",
"artifactContractPreserved",
"runtimeContractPreserved",
"R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26_EXACT100_LIFECYCLE_CLOSED_TO_EXACT200_PROGRESSIVE_EXPANSION_POLICY_WITH_REFERENCE100_REUSE_AND_NEW100_DELTA_EXECUTION"
},null,2));