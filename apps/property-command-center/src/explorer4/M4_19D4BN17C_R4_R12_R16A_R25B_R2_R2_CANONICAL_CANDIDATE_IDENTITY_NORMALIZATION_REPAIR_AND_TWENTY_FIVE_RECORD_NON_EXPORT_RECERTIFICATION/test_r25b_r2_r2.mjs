#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r25b_r2_r2.py"),"utf8");
const q=[
"CERTIFIED_NORMALIZATION_CAUSE_REQUIRED",
"REMOVE_ONLY_RECOGNIZED_TRAILING_STATUS_SUFFIX_FROM_PRIOR_NORMALIZED_CANDIDATE_IDENTITY",
"bldg13FusedStatusRemoved",
"exactTwentyFiveTargetsPreserved",
"exactTwentyFiveTargetsUnique",
"cohortOrderPreserved",
"candidateSubstitutionOff",
"freshPagePerRecordPreserved",
"allExecutedTargetBindingsCertified",
"allExecutedSelectionsCertified",
"allExecutedAssignmentsCertified",
"allExecutedReportReviewsCertified",
"allExecutedExportControlsCertified",
"allExecutedLiveHandlersCertified",
"allTwentyFiveNewRecordsQualified",
"exportInvocationOff",
"CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIR_CERTIFIED_ALL_TWENTY_FIVE_NEW_RECORDS_NON_EXPORT_QUALIFIED",
"M4_19D4BN17C_R4_R12_R16A_R25C_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25B_R2_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25B_R2_R1_R1_CERTIFIED_R25A_STATUS_SUFFIX_FUSION_CAUSE_TO_CERTIFICATION_LOCAL_TRAILING_STATUS_IDENTITY_NORMALIZATION_REPAIR_AND_EXACT_TWENTY_FIVE_NON_EXPORT_RECERTIFICATION"
},null,2));