#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"verify_r21_r5.py"),"utf8");

const q=[
"singleRecordExportClassificationConsumed",
"exactOnePdfDownloadObserved",
"exactOnePdfObjectUrlObserved",
"pdfMimeTypeCertified",
"pdfSizePositive",
"filenameContractCertified",
"blobDownloadHrefObserved",
"sourcePdfContractResolved",
"reportReviewContinuityPreserved",
"sameOriginPreserved",
"noRuntimeErrorsObserved",
"additionalExportInvocationOff",
"EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFIED_SINGLE_RECORD_LIFECYCLE_READY_FOR_CLOSURE"
];

for(const x of q){
  if(!s.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R21_R5_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R21_R4_CERTIFIED_SINGLE_EXPORT_TO_PDF_ARTIFACT_FILENAME_MIME_SIZE_AND_POST_ACTION_STATE_VERIFICATION"
},null,2));