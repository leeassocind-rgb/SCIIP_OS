import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r4_r3_r3_r1.py",import.meta.url),"utf8");
const req=[
"POST_PREFLIGHT_REACHED_BUT_NO_INSTRUMENTED_AWAIT_ENTERED_EXIT13_CONTROL_FLOW_GAP",
"syntax-safe instrumentation",
"R29B_SYNC_SAFE:",
"SAFE_BREADCRUMB_COUNT",
"LAST_COMPLETED_BREADCRUMB:",
"runner.write_text(original)",
"timeout=8",
"Governed data mutation: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R3_R1_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);