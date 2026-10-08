#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r25b_r2_r1.py"),"utf8");
const q=[
"SINGLE_RECORD_POST_SELECTION_IDENTITY_CAUSAL_DIAGNOSIS",
"NE of Interstate 15 and Stoddard Wells Bldg 1-3PROPOSED/",
"record12SelectionClickedPreviously",
"record12SelectedPropertyFailedPreviously",
"preClickCandidateInventoryCaptured",
"rawTargetIdentityCaptured",
"normalizedTargetIdentityCaptured",
"exactNormalizedContainsCountsCaptured",
"singleBoundedTargetClickOnly",
"postClickSelectedMarkerSamplesCaptured",
"selectedMarkerIdentityCaptured",
"Bldg_1_3_SELECTION_SUCCEEDS_SELECTED_MARKER_IDENTITY_DIFFERS_FROM_R25A_NORMALIZED_TARGET_READBACK_PREDICATE_TOO_STRICT",
"Bldg_1_3_CLICK_COLLAPSES_TO_BASE_PROPERTY_IDENTITY_WRONG_RECORD_SELECTION_OR_CANONICALIZATION_COLLISION",
"Bldg_1_3_SELECTED_IDENTITY_MATCHES_TARGET_PRIOR_FAILURE_TRANSIENT_READBACK_RACE",
"assignmentsInvocationOff",
"generateInvocationOff",
"exportInvocationOff",
"M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_SELECTED_PROPERTY_IDENTITY_NORMALIZATION_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25B_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25B_R2_RECORD_12_BINDING_SUCCESS_WITH_SELECTED_PROPERTY_READBACK_FAILURE_TO_SINGLE_RECORD_PRE_CLICK_VS_POST_CLICK_IDENTITY_CAUSAL_DIAGNOSIS"
},null,2));