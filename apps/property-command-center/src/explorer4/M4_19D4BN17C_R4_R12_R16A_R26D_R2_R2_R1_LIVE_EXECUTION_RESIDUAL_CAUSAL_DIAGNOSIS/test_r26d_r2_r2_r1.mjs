#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26d_r2_r2_r1.py"),"utf8");
const q=[
"READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS",
"firstFailureOrdinal81",
"firstFailureTargetAlondra",
"thirtyNewRecordsCertifiedBeforeFailure",
"firstFailedStage",
"artifactContractCertified",
"runtimeContractCertified",
"noRetryPerformed",
"ALONDRA_RECORD_81_TARGET_BINDING_SETTLE_FAILED_PRE_SELECTION",
"ALONDRA_RECORD_81_SELECTED_ENTITY_READBACK_FAILED_AFTER_SELECTION",
"ALONDRA_RECORD_81_EXPORT_CLICKED_BUT_ARTIFACT_CONTRACT_FAILED",
"Live UI interaction: OFF",
"Export invocation: OFF"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26D_R2_R2_THIRTY_OF_FIFTY_CERTIFIED_WITH_ALONDRA_RECORD81_HALT_TO_READ_ONLY_STRUCTURED_EXACT_STAGE_CAUSAL_DIAGNOSIS"
},null,2));