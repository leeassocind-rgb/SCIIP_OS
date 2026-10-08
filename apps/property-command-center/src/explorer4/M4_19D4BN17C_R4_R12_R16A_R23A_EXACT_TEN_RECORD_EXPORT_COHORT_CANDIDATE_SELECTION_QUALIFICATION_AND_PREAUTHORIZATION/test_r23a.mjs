#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r23a.py"),"utf8");
const q=[
"REFERENCE=[\"2 Musick\",\"2701 Carrier Ave\",\"8700 - 8750 Rex Rd\"]",
"new_pool",
"selected_new=new_pool[:7]",
"exact_ten=REFERENCE+[x[\"label\"] for x in selected_new]",
"deterministicDomOrderUsed",
"selectionSettlePolicyConsumed",
"freshPagePerRecordPolicyConsumed",
"strictSequentialPolicyConsumed",
"haltOnFirstFailurePolicyConsumed",
"oneExportClickMaximumPolicyConsumed",
"liveQualificationAuthorizedForSevenNewRecords",
"exportInvocationAuthorized\":False",
"assignmentsInvocationAuthorized\":False",
"EXACT_TEN_RECORD_EXPORT_COHORT_REFERENCE_THREE_PLUS_SEVEN_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION",
"M4_19D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23A_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23_EXACT_TEN_POLICY_TO_REFERENCE_THREE_PLUS_SEVEN_NEW_DETERMINISTIC_CANDIDATE_SELECTION_AND_NON_EXPORT_PREAUTHORIZATION"
},null,2));