#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r25a.py"),"utf8");
const q=[
"R25_EXACT_FIFTY_EXPANSION_POLICY_REQUIRED",
"referenceTwentyFivePreserved",
"twentyFiveNewCandidatesResolved",
"exactFiftyCandidateCohortResolved",
"exactFiftyCandidateCohortUnique",
"deterministicDomOrderUsed",
"candidateStatusSuffixNormalizationUsed",
"fiveSecondTargetBindingPolicyConsumed",
"threeSampleTargetBindingPolicyConsumed",
"freshPagePerRecordPolicyConsumed",
"strictSequentialPolicyConsumed",
"haltOnFirstFailurePolicyConsumed",
"oneExportClickMaximumPolicyConsumed",
"EXACT_FIFTY_RECORD_EXPORT_COHORT_REFERENCE_TWENTY_FIVE_PLUS_TWENTY_FIVE_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION",
"M4_19D4BN17C_R4_R12_R16A_R25B_TWENTY_FIVE_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25A_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25_EXACT_FIFTY_POLICY_TO_REFERENCE_TWENTY_FIVE_PLUS_TWENTY_FIVE_NEW_DETERMINISTIC_LIVE_CANDIDATE_SELECTION_AND_NON_EXPORT_PREAUTHORIZATION"
},null,2));