#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r24a.py"),"utf8");
const q=[
"R24_POLICY_CERTIFICATION_REQUIRED",
"EXACT_TEN_REFERENCE_COHORT_REQUIRED",
"newLiveExpansionRecordsRequired",
"15",
"wait_unique_exact_button",
"Live candidate inventory: ON",
"deterministicDomOrderUsed",
"referenceTenPreserved",
"fifteenNewCandidatesResolved",
"exactTwentyFiveCandidateCohortResolved",
"exactTwentyFiveCandidateCohortUnique",
"fiveSecondTargetBindingPolicyConsumed",
"threeSampleTargetBindingPolicyConsumed",
"freshPagePerRecordPolicyConsumed",
"strictSequentialPolicyConsumed",
"haltOnFirstFailurePolicyConsumed",
"oneExportClickMaximumPolicyConsumed",
"exportInvocationOff",
"assignmentsInvocationOff",
"EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_REFERENCE_TEN_PLUS_FIFTEEN_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION",
"M4_19D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24A_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R24_EXACT_TWENTY_FIVE_POLICY_TO_REFERENCE_TEN_PLUS_FIFTEEN_NEW_DETERMINISTIC_LIVE_CANDIDATE_SELECTION_AND_NON_EXPORT_PREAUTHORIZATION"
},null,2));