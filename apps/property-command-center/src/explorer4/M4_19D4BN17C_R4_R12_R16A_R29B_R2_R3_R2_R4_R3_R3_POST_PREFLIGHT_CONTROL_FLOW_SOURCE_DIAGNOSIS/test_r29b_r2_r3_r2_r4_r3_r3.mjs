import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r4_r3_r3.py",import.meta.url),"utf8");
const req=[
"POST_PREFLIGHT_REACHED_BUT_NO_INSTRUMENTED_AWAIT_ENTERED_EXIT13_CONTROL_FLOW_GAP",
"POST_PREFLIGHT_SEGMENT_START_LINE",
"FIRST_AWAIT_NAME",
"R29B_SYNC_POST_PREFLIGHT_ENTER",
"R29B_SYNC_BEFORE:",
"R29B_FIRST_AWAIT_BOUNDARY_REACHED",
"LAST_COMPLETED_BREADCRUMB:",
"timeout=8",
"runner.write_text(original)",
"Governed data mutation: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R3_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);