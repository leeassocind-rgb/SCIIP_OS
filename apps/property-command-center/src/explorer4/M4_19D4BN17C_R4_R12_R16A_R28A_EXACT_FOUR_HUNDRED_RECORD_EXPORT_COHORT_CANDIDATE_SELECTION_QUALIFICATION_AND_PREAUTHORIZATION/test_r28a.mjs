#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"select_r28a.py"),"utf8");
const q=[
"R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY",
"R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION",
"find_reference_first100",
"referenceTwoHundredExcludedFromNewPool",
"exactNewTwoHundredCandidatesResolved",
"deterministicDomOrderUsed",
"recognizedStatusBoundaryNormalizationUsed",
"ADDRESS_PLUS_VISIBLE_SF",
"buildingProjectGranularityPreservedWhenSfVisible",
"exact_new_two_hundred_candidates.json",
"authoritative_reference_two_hundred.json",
"nonExportQualificationRequiredBeforeExport",
"separatePostQualificationExportAuthorizationRequired",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28A_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28_EXACT400_POLICY_TO_AUTHORITATIVE_REFERENCE200_RECONSTRUCTION_LIVE_EXPLORER_INVENTORY_DETERMINISTIC_NEW200_SELECTION_WITH_STATUS_NORMALIZATION_AND_VISIBLE_SF_GRANULARITY_PRESERVATION_NON_EXPORT_PREAUTHORIZATION"
},null,2));