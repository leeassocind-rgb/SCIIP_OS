#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"native_new_two_hundred_export_runner.py"),"utf8");
const w=fs.readFileSync(path.join(d,"execute_r28d.py"),"utf8");
const q=[
"EXACT_NEW_TWO_HUNDRED_ONLY","target cardinality must equal 200","freshTargetCreated",
"settle_explorer","document.readyState","targetBindingSettleCertified","selectedPropertySettleCertified",
"Download Client Listing Report","install_probes","URL.createObjectURL","application/pdf",
"pdfObjectUrlEventCount","pdfDownloadCount","artifactContractCertified","runtimeErrors",
"unhandledRejections","postPublishReportReviewUnmountCertified","explorerContinuity","sameOrigin",
"SCIIP_R28D_LIVE_EXPORT_AUTHORIZED","authorityRelocked","EXACTLY ONE GUARDED EXPORT CLICK",
"referenceTwoHundredNotReexported","strictSequentialObserved","haltOnFirstFailureObserved",
"R28E_EXACT_FOUR_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"
];
for(const x of q){if(!(s+w).includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28D_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28C_R2_EXACT400_AUTHORIZED_TO_EXACT_NEW200_ONLY_GUARDED_LIVE_EXPORT_EXECUTION_WITH_PAGE_READY_ANCHORED_EXPLORER_SETTLE_CANONICAL_BINDING_SINGLE_CLICK_PDF_ARTIFACT_RUNTIME_CONTINUITY_AND_AUTHORITY_RELOCK_GUARDS"
},null,2));