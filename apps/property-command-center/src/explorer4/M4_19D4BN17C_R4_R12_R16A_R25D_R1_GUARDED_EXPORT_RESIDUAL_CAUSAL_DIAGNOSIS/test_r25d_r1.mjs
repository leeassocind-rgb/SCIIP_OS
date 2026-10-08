#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r25d_r1.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_DIAGNOSIS",
"R25D_INCOMPLETE_STATE_REQUIRED",
"firstTwoRecordsCertified",
"thirdRecordOutcomeResolved",
"freshPageCreationReadbackCaptured",
"explorerSettleReadbackCaptured",
"targetBindingSettleReadbackCaptured",
"selectionReadbackCaptured",
"exportClickReadbackCaptured",
"THIRD_RECORD_FRESH_PAGE_CREATED_BUT_EXPLORER_CONTROL_DID_NOT_SETTLE",
"THIRD_RECORD_EXPLORER_SETTLED_TARGET_BINDING_DID_NOT_SETTLE",
"noRetryPerformed",
"liveUiInteractionOff",
"exportInvocationOff",
"M4_19D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25D_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25D_TWO_OF_FIFTY_CERTIFIED_WITH_THIRD_PRE_SELECTION_FAILURE_TO_READ_ONLY_EXACT_STAGE_RESIDUAL_CAUSAL_DIAGNOSIS"
},null,2));