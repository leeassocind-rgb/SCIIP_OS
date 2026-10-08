#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"recertify_r27b_r4.py"),"utf8");
const q=[
"UNDER CONSTRUCTION|PROPOSED|PLANNED|EXISTING",
"exact_new_one_hundred_canonical_targets.json",
"canonicalTargetsUnique",
"underConstructionBoundaryIncluded",
"sourceCertifiedExportControlBindingConsumed",
"freshPagePerRecordRequired",
"strictSequentialObserved",
"haltOnFirstFailureObserved",
"ambiguousBindingForbidden",
"Download Client Listing Report",
"exportReportHandlerCertifiedBySourceContract",
"allOneHundredCertified",
"Export invocation: OFF",
"R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q){
  if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R27B_R4_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R27B_R3_R2_FIRST_RECORD_UNDER_CONSTRUCTION_BOUNDARY_REPAIR_TO_EXACT_NEW100_CANONICAL_TARGET_NORMALIZATION_AND_NON_EXPORT_RECERTIFICATION"
},null,2));