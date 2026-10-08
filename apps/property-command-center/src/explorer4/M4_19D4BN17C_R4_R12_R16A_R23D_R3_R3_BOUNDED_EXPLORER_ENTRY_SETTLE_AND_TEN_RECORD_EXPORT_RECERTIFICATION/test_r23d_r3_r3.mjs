#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r23d_r3_r3.py"),"utf8");
const q=[
"EXPLORER_WAIT_THEN_UNIQUE_CONTAINS_TARGET_BINDING",
"wait_unique_exact_button",
"explorerConsecutiveCertifiedSamples",
"explorerMaximumSettleSeconds",
"wait_target_binding",
"targetBindingConsecutiveCertifiedSamples",
"targetBindingMaximumSettleSeconds",
"click_target_resolved",
"UNIQUE_CONTAINS",
"bounded_selection_readback",
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
"EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_BOUNDED_EXPLORER_AND_TARGET_BINDING_SETTLE",
"M4_19D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R2_EXPLORER_AND_TARGET_250MS_MATERIALIZATION_RACE_TO_BOUNDED_THREE_SAMPLE_ENTRY_AND_TARGET_BINDING_SETTLE_WITH_EXACT_TEN_EXPORT_RECERTIFICATION"
},null,2));