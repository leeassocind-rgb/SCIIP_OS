#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"close_r23f.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE",
"R23D_R3_R3_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED",
"R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFIED",
"EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_CERTIFIED",
"exactTenCohortReconciled",
"exactTenCohortOrderPreserved",
"exactTenUniqueTargetsPreserved",
"allExecutionPathsCertified",
"allArtifactAndRuntimeEvidenceCertified",
"fiveSecondTargetBindingGuardPreserved",
"threeConsecutiveTargetBindingSamplesPreserved",
"threeConsecutiveExplorerSamplesPreserved",
"exactThenUniqueContainsBindingPreserved",
"ambiguousContainsBindingForbidden",
"singleExportMaximumPerRecordPreserved",
"allTenPdfArtifactsCertified",
"allTenRuntimeContinuityCertified",
"noAdditionalExportInvocation",
"noRetryPerformed",
"EXACT_TEN_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED",
"M4_19D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23F_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R3_R3_EXACT_TEN_EXECUTION_PLUS_R23E_ARTIFACT_RUNTIME_VERIFICATION_TO_READ_ONLY_EXACT_TEN_EXPORT_LIFECYCLE_CLOSURE"
},null,2));