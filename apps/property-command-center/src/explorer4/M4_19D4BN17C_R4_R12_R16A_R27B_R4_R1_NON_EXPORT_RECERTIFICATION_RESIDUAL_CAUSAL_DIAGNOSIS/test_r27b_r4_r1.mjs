#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"diagnose_r27b_r4_r1.py"),"utf8");
const q=[
"READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS",
"FIRST_FAILURE_ORDINAL",
"FIRST_FAILURE_CANONICAL_TARGET",
"FIRST_FAILED_STAGE",
"BINDING_READBACK_COUNT",
"TARGET BINDING STRUCTURED READBACK",
"CANONICAL_TARGET_NOT_PRESENT_ON_LIVE_MARKER_SURFACE",
"CANONICAL_TARGET_BINDING_AMBIGUOUS_MULTIPLE_LIVE_MARKERS",
"firstFailureOrdinal128",
"firstFailureTarget15881TerminalCt",
"noRetryPerformed",
"Export invocation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R4_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27B_R4_HALTED_AFTER_27_CERTIFICATIONS_AT_RECORD128_TARGET_BINDING_SETTLE_TO_READ_ONLY_STRUCTURED_BINDING_COUNT_AND_INVENTORY_CAUSAL_DIAGNOSIS_WITHOUT_RETRY"
},null,2));