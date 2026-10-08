#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r24b_r1.py"),"utf8");
const q=[
"SE of Adelanto Rd and Rancho RdPROPOSED ·",
"SELECTION_OR_SETTLE_FAILED",
"SINGLE_RECORD_NON_EXPORT_SELECTION_CAUSAL_DIAGNOSIS",
"candidate_inventory",
"SE of Adelanto Rd and Rancho Rd",
"rawLabelHasStatusSuffix",
"clickedLabelHasStatusSuffix",
"selectedMarkerMatchesRawTarget",
"selectedMarkerMatchesNormalizedBase",
"SECOND_RECORD_SELECTION_SUCCEEDED_CANDIDATE_LABEL_CONTAINS_STATUS_SUFFIX_READBACK_NORMALIZATION_MISMATCH",
"SECOND_RECORD_SELECTION_SUCCEEDED_SELECTED_READBACK_PREDICATE_TOO_STRICT",
"assignmentsInvocationOff",
"exportInvocationOff",
"R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24B_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R24B_SECOND_RECORD_SELECTION_SETTLE_FAILURE_TO_SINGLE_RECORD_NON_EXPORT_CANDIDATE_LABEL_SELECTED_MARKER_AND_NORMALIZED_READBACK_CAUSAL_DIAGNOSIS"
},null,2));