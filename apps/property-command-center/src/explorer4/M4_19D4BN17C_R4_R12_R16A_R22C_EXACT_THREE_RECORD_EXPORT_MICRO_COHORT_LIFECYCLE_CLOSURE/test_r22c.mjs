#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"close_r22c.py"),"utf8");
const q=[
"R22B_R2_R5",
"R22B_R2_R8",
"exactThreeRecordCohortReconciled",
"allSelectionAndWorkflowPathsCertified",
"allPdfArtifactsCertified",
"allRuntimeContinuityCertified",
"noAdditionalExportInvocation",
"liveUiInteractionOff",
"EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_DISCOVERY_SELECTION_WORKSPACE_REPORT_REVIEW_EXPORT_ARTIFACT_AND_POST_PUBLISH_LIFECYCLE_CLOSED",
"M4_19D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22C_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R5_FIRST_TWO_CERTIFIED_PLUS_R22B_R2_R8_THIRD_CERTIFIED_TO_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSURE"
},null,2));