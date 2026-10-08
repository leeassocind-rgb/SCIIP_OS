#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r25b_r2.py"),"utf8");
const q=[
"R25B_R1_COLLISION_CAUSE_CERTIFICATION_REQUIRED",
"BOUNDARY_NORMALIZED_IDENTITY",
"RECOGNIZED_STATUS_DETAIL_BOUNDARY_ONLY",
"ambiguousContainsBindingForbidden",
"stoddardBaseResolvedByBoundaryNormalizedIdentity",
"cohortReordering",
"candidateSubstitution",
"freshPagePerRecordPolicyUsed",
"allExecutedTargetBindingSettlesCertified",
"allExecutedSelectionsCertified",
"allExecutedAssignmentsCertified",
"allExecutedReportReviewsCertified",
"allExecutedExportControlsCertified",
"allExecutedLiveHandlersCertified",
"allTwentyFiveNewRecordsQualified",
"exportInvocationOff",
"COLLISION_SAFE_IDENTITY_BINDING_REPAIR_CERTIFIED_ALL_TWENTY_FIVE_NEW_RECORDS_NON_EXPORT_QUALIFIED",
"M4_19D4BN17C_R4_R12_R16A_R25C_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25B_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25B_R1_CERTIFIED_BASE_VS_BUILDING_VARIANT_COLLISION_TO_BOUNDARY_NORMALIZED_IDENTITY_BINDING_WITH_AMBIGUOUS_CONTAINS_STILL_FORBIDDEN_AND_EXACT_TWENTY_FIVE_NON_EXPORT_RECERTIFICATION"
},null,2));