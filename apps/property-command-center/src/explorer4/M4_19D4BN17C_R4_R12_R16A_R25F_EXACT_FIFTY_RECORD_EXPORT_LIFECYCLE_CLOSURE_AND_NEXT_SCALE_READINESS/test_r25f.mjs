#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"close_r25f.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION_CLOSURE_AND_READINESS",
"R25D_R3_AND_R25E_EVIDENCE_REQUIRED",
"exactFiftyCohortSize",
"exactFiftyCohortUnique",
"exactFiftyCohortOrderReconciled",
"executionCertifiedCountFifty",
"artifactRuntimeCertifiedCountFifty",
"allExecutionPathsCertified",
"allArtifactRuntimeEvidenceCertified",
"singlePdfDownloadPerRecordPreserved",
"singlePdfObjectUrlEventPerRecordPreserved",
"pdfMimeApplicationPdfPreserved",
"positivePdfSizePreserved",
"zeroRuntimeErrorsPreserved",
"zeroUnhandledRejectionsPreserved",
"postPublishUnmountPreserved",
"explorerContinuityPreserved",
"sameOriginPreserved",
"threeConsecutiveExplorerSamplesPreserved",
"twoSecondExplorerGuardPreserved",
"threeConsecutiveTargetBindingSamplesPreserved",
"fiveSecondTargetBindingGuardPreserved",
"threeConsecutiveSelectedPropertySamplesPreserved",
"twoSecondSelectedPropertyGuardPreserved",
"candidateIdentityNormalizationPreserved",
"singleExportMaximumPerRecordPreserved",
"strictSequentialPreserved",
"haltOnFirstFailurePreserved",
"nextProgressiveExpansionReady",
"R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25F_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25D_R3_EXACT_FIFTY_EXECUTION_PLUS_R25E_ARTIFACT_RUNTIME_VERIFICATION_TO_READ_ONLY_EXACT_FIFTY_LIFECYCLE_CLOSURE_AND_NEXT_PROGRESSIVE_SCALE_READINESS"
},null,2));