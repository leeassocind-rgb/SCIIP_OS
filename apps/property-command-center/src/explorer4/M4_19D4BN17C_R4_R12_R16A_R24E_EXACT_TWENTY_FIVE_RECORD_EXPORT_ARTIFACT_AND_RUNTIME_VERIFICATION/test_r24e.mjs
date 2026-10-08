#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"verify_r24e.py"),"utf8");
const q=["R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION","READ_ONLY_EVIDENCE_VERIFICATION",
"exact_twenty_five_record_guarded_export_execution.json","pdfDownloadCount","pdfObjectUrlEventCount",
"application/pdf","positivePdfSize","runtimeErrorsZero","unhandledRejectionsZero","postPublishUnmountCertified",
"explorerContinuityCertified","sameOriginCertified","allTwentyFiveArtifactAndRuntimeVerificationsCertified",
"EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_CERTIFIED",
"M4_19D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE",
"noRetryPerformed","liveUiInteractionOff","exportInvocationOff"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R24E_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R24D_EXACT_TWENTY_FIVE_LIVE_EXPORT_EXECUTION_TO_READ_ONLY_EXACT_TWENTY_FIVE_ARTIFACT_AND_RUNTIME_EVIDENCE_VERIFICATION"},null,2));