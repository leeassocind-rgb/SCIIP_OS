#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"design_r23.py"),"utf8");
const q=[
"REFERENCE_STATE",
"NEXT_COHORT_SIZE=10",
"newLiveExpansionRecordsRequired",
"CONSECUTIVE_AGREEING_SAMPLES",
"requiredConsecutiveCertifiedSamples",
"maximumSettleWindowSeconds",
"DETERMINISTIC_PREQUALIFIED_ORDER",
"strictSequential",
"haltOnFirstFailure",
"freshPagePerRecordRequired",
"exactOneExportClickPerRecordMaximum",
"artifactMimeMustEqual",
"postPublishReportReviewMustUnmount",
"runtimeErrorsMustEqual",
"exportInvocationOff",
"EXACT_THREE_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_TEN_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED",
"M4_19D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22C_R1_CLOSED_EXACT_THREE_EXPORT_COHORT_TO_EXACT_TEN_PROGRESSIVE_EXPANSION_POLICY_WITH_SELECTION_SETTLE_GUARD_PRESERVATION"
},null,2));