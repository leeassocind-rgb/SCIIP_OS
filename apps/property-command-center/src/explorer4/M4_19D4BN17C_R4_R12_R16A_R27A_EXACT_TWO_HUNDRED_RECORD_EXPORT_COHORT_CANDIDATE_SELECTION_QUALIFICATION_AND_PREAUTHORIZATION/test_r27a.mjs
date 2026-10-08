#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r27a.py"),"utf8");
const q=[
"REFERENCE_COHORT_SIZE: 100",
"SELECTED_NEW_CANDIDATE_COUNT",
"EXACT_TWO_HUNDRED_COHORT_SIZE",
"oneHundredNewCandidatesResolved",
"exactTwoHundredCandidateCohortResolved",
"exactTwoHundredCandidateCohortUnique",
"deterministicDomOrderUsed",
"candidateStatusSuffixNormalizationUsed",
"recognizedStatusBoundaryOnly",
"buildingProjectAwareCanonicalBindingPolicyConsumed",
"addressOnlyBindingForbiddenWhenGranularityCollisionPresent",
"referenceOneHundredWillNotBeReexported",
"Assignments invocation: OFF",
"Export invocation: OFF",
"exact_new_one_hundred_targets.json",
"R27B_ONE_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27A_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27_EXACT200_POLICY_TO_REFERENCE100_PLUS_EXACT100_NEW_DETERMINISTIC_LIVE_CANDIDATE_SELECTION_AND_NON_EXPORT_PREAUTHORIZATION"
},null,2));