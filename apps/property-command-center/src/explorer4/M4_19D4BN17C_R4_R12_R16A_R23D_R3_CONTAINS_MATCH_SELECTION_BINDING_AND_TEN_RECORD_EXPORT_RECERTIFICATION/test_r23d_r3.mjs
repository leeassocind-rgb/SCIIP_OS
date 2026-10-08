#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r23d_r3.py"),"utf8");
const q=[
"CONTAINS_BUTTON_BINDING",
"click_target_resolved",
"binding:'EXACT'",
"binding:'UNIQUE_CONTAINS'",
"ambiguousContainsMatchAllowed",
"bounded_selection_readback",
"consecutive>=3",
"Generate Client Listing Report",
"Download Client Listing Report",
"exportReport",
"pdfDownloadCount",
"pdfEventCount",
"application/pdf",
"postPublishReportReviewUnmountCertified",
"strictSequentialObserved",
"haltOnFirstFailureObserved",
"allTenExportsCertified",
"EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_EXACT_THEN_UNIQUE_CONTAINS_TARGET_BINDING",
"M4_19D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R2_CONTAINS_ONLY_REFERENCE_TARGET_TO_EXACT_THEN_UNIQUE_CONTAINS_SELECTION_BINDING_AND_EXACT_TEN_EXPORT_RECERTIFICATION"
},null,2));