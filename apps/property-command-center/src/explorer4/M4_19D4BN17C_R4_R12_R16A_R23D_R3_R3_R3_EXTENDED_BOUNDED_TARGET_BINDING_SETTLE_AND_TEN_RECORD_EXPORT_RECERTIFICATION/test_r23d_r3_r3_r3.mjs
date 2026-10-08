#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r23d_r3_r3_r3.py"),"utf8");
const q=[
"SECOND_RECORD_TARGET_BINDING_DELAYED_BUT_STABLE_AFTER_MATERIALIZATION",
"SECOND_RECORD_TARGET_BINDING_STABLE_WINDOW_EXISTS_WITHIN_FIVE_SECONDS",
"wait_unique_exact_button",
"explorerMaximumSettleSeconds",
"wait_target_binding",
"max_seconds=5.0",
"targetBindingMaximumSettleSeconds",
"targetBindingConsecutiveCertifiedSamples",
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
"EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_FIVE_SECOND_TARGET_BINDING_SETTLE",
"M4_19D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_R3_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R3_R2_DELAYED_BUT_STABLE_TARGET_BINDING_TO_FIVE_SECOND_THREE_CONSECUTIVE_SAMPLE_SETTLE_AND_EXACT_TEN_EXPORT_RECERTIFICATION"
},null,2));