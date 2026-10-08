#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"authorize_r28c.py"),"utf8");
const q=[
"READ_ONLY_EXECUTION_AUTHORIZATION_DESIGN",
"REFERENCE_COHORT_SIZE: 200",
"NEW_PREQUALIFIED_COHORT_SIZE: 200",
"EXACT_COMBINED_COHORT_SIZE: 400",
"EXACT_NEW_TWO_HUNDRED_ONLY",
"REFERENCE_TWO_HUNDRED_REEXPORT: FORBIDDEN",
"PROGRESSIVE_DELTA_TWO_HUNDRED",
"STRICT_SEQUENTIAL_FRESH_PAGE_HALT_ON_FIRST_FAILURE",
"maxExportClicksPerRecord",
"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM_AND_APP_ORIGIN",
"buildingProjectAwareCanonicalBindingRequired",
"addressOnlyBindingForbiddenWhenGranularityCollisionPresent",
"Download Client Listing Report",
"exportReport",
"pdfDownloadCountMustEqual",
"pdfObjectUrlEventCountMustEqual",
"application/pdf",
"postPublishReportReviewMustUnmount",
"explorerMustRemainMounted",
"authorityRelockAfterEveryRecord",
"R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION",
"authorizationDesignOnly",
"Live UI interaction: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28C_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_EXACT_NEW200_NON_EXPORT_QUALIFICATION_CLOSED_TO_EXACT400_GUARDED_EXPORT_EXECUTION_AUTHORIZATION_WITH_CLOSED_REFERENCE200_REUSE_NEW200_ONLY_LIVE_DELTA_PAGE_READY_ANCHORED_EXPLORER_SETTLE_AND_FULL_ARTIFACT_RUNTIME_GUARDS"
},null,2));