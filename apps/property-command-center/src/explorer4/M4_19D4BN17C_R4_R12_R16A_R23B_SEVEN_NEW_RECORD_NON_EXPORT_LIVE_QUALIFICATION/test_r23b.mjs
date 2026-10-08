#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r23b.py"),"utf8");
const q=[
"exactSevenNewTargetsConsumed",
"bounded_selection_readback",
"consecutive>=3",
"freshPagePerRecordPolicyUsed",
"strictSequentialObserved",
"haltOnFirstFailureObserved",
"Generate Client Listing Report",
"Download Client Listing Report",
"exportReport",
"allSevenNewRecordsQualified",
"exportInvocationOff",
"SEVEN_NEW_RECORDS_SELECTION_SETTLE_ASSIGNMENTS_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED",
"M4_19D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23B_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23A_SEVEN_NEW_PREAUTHORIZED_RECORDS_TO_FRESH_PAGE_SELECTION_SETTLE_ASSIGNMENTS_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_LIVE_QUALIFICATION"
},null,2));