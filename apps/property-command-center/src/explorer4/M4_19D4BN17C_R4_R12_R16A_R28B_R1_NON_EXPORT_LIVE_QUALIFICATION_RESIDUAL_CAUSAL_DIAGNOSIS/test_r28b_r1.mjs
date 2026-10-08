#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"diagnose_r28b_r1.py"),"utf8");
const q=[
"READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS",
"firstFailureOrdinal201",
"explorerSettleReadbackCaptured",
"explorerEntryReadbackCaptured",
"failureOccurredBeforeTargetBinding",
"downstreamWorkflowUntouched",
"RECORD_201_EXPLORER_CONTROL_SETTLED_BUT_ENTRY_CLICK_DID_NOT_CERTIFY",
"R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DEEP_DIAGNOSIS",
"R28B retry: OFF",
"Live UI interaction: OFF",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_HALTED_AT_RECORD201_AFTER_EXPLORER_SETTLE_WITH_EXPLORER_ENTRY_FAILURE_TO_READ_ONLY_EXACT_STAGE_RESIDUAL_CAUSAL_DIAGNOSIS"
},null,2));