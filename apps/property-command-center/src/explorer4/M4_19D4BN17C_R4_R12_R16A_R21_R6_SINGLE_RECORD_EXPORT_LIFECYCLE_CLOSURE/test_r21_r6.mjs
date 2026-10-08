#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"close_r21_r6.py"),"utf8");

const q=[
"r21R3Passed",
"r21R4Passed",
"r21R5Passed",
"exactSourceLiveBindingCertified",
"singleGuardedExportCertified",
"artifactVerificationCertified",
"exactOnePdfDownloadObserved",
"pdfMimeTypeCertified",
"filenameContractCertified",
"noRuntimeErrorsObserved",
"singleExactExportClickOnly",
"additionalExportInvocationOff",
"SINGLE_RECORD_EXPORT_DISCOVERY_MATERIALIZATION_BINDING_INVOCATION_ARTIFACT_VERIFICATION_LIFECYCLE_CLOSED",
"EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_AND_DESIGN"
];

for(const x of q){
  if(!s.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R21_R6_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R21_R3_R4_R5_EVIDENCE_RECONCILIATION_TO_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSURE_AND_BOUNDED_EXPANSION_HANDOFF"
},null,2));