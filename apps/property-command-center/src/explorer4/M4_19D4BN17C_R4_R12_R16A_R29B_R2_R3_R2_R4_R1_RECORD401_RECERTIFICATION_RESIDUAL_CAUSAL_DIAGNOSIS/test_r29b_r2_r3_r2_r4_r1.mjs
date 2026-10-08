import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r4_r1.mjs",import.meta.url),"utf8");
const req=[
"UNSETTLED_TOP_LEVEL_AWAIT",
"R4_AUTHORITATIVE_R29B_EXIT_CODE",
"TOP_LEVEL_AWAIT_HIT_COUNT",
"TOTAL_AWAIT_HIT_COUNT",
"PROMISE_LIFECYCLE_HIT_COUNT",
"RAW_WEBSOCKET_SOURCE_HIT_COUNT",
"RECORD401_PREOUTCOME_CONTROL_FLOW_STRANDED_ON_UNSETTLED_TOP_LEVEL_AWAIT",
"FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION",
"Live UI interaction: OFF",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R1_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);
