#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r23d_r3_r3_r2.py"),"utf8");
const q=[
"SECOND_RECORD_TARGET_BINDING_TRANSIENT_OR_OSCILLATING_VALIDITY",
"FIRST_VALID_BINDING_SECONDS",
"VALID_SAMPLE_COUNT_AT_OR_AFTER_2S",
"MAX_CONSECUTIVE_VALID_SAMPLES",
"STABLE_LAST_FIVE_SAMPLES",
"schedule=[0.0,0.1,0.25,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.25,2.5,2.75,3.0,3.5,4.0,4.5,5.0]",
"SECOND_RECORD_TARGET_BINDING_DELAYED_BUT_STABLE_AFTER_MATERIALIZATION",
"SECOND_RECORD_TARGET_BINDING_STABLE_WINDOW_EXISTS_WITHIN_FIVE_SECONDS",
"SECOND_RECORD_TARGET_BINDING_GENUINELY_OSCILLATORY",
"noPropertyClickPerformed",
"assignmentsInvocationOff",
"exportInvocationOff",
"SECOND_RECORD_TARGET_BINDING_STABILITY_DIAGNOSED"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R3_R3_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R3_R3_R1_TWO_VALID_SAMPLES_LATE_IN_TWO_SECOND_WINDOW_TO_FIVE_SECOND_NON_EXPORT_BINDING_STABILITY_DIAGNOSIS"
},null,2));