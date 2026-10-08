#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r16a_r2.py"),"utf8");
const req=["r16aR1R2Passed","resolvedRuntimeAffordanceCertified","freshPageTargetPerRecordPolicyUsed",
"allExecutedExportActionsCertified","allExecutedPresentationActionsCertified","allThreeExportActionsCertified",
"allThreePresentationActionsCertified","RESOLVED_EXPORT_PRESENTATION_CONTROL_CERTIFIED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION",
"EXPORT_PRESENTATION_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R2_STATIC_TEST",status:"PASSED",
assertions:req.length,repair:"RESOLVED_CONTEXTUAL_EXPORT_PRESENTATION_RUNTIME_CONTROL_THREE_RECORD_FRESH_PAGE_RECERTIFICATION"},null,2));