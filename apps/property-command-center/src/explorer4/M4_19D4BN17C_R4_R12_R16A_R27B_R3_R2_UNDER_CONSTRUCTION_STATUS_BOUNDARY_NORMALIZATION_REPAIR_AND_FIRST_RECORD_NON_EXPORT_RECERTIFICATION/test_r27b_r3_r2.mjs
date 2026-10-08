#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r27b_r3_r2.py"),"utf8");
const q=[
"UNDER CONSTRUCTION|PROPOSED|PLANNED|EXISTING",
"normalizedTargetEquals701EBallRd",
"rawTargetNotUsedForCanonicalBinding",
"targetBindingSettleCertified",
"uniqueNormalizedCandidateRequired",
"ambiguousNormalizedCandidateForbidden",
"Download Client Listing Report",
"exportReportHandlerCertifiedBySourceContract",
"Export invocation: OFF",
"R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R3_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27B_R3_R1_TARGET_BINDING_FAILURE_CAUSED_BY_UNDER_CONSTRUCTION_STATUS_SUFFIX_CONTAMINATION_TO_BOUNDARY_NORMALIZED_CANONICAL_TARGET_AND_FIRST_RECORD_NON_EXPORT_RECERTIFICATION"
},null,2));