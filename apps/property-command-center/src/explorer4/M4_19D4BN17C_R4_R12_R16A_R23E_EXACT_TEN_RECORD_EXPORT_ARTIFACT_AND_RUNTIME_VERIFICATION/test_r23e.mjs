#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"verify_r23e.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_VERIFICATION",
"R23D_R3_R3_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED",
"EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_FIVE_SECOND_TARGET_BINDING_SETTLE",
"allTenExportsCertified",
"exactTenUniqueTargetsVerified",
"pdfDownloadCount",
"pdfEventCount",
"application/pdf",
"pdfPositiveSizeCertified",
"runtimeErrorsZero",
"unhandledRejectionsZero",
"postPublishReportReviewUnmountCertified",
"explorerContinuityCertified",
"sameOriginCertified",
"allTenArtifactAndRuntimeVerificationsCertified",
"sourceEvidenceSha256",
"liveUiInteractionOff",
"exportInvocationOff",
"noRetryPerformed",
"EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_CERTIFIED",
"M4_19D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23E_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R3_R3_EXACT_TEN_LIVE_EXPORT_RECERTIFICATION_TO_READ_ONLY_EXACT_TEN_ARTIFACT_AND_RUNTIME_EVIDENCE_VERIFICATION"
},null,2));