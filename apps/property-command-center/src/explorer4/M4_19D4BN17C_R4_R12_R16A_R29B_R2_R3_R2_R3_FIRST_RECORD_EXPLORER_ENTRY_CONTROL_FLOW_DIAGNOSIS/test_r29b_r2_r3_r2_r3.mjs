import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r3.mjs",import.meta.url),"utf8");
const req=[
"SINGLE_FRESH_PAGE_EXPLORER_ENTRY_CONTROL_FLOW_DIAGNOSIS",
"EXPLORER_SETTLE_CERTIFIED",
"PRE_CLICK_EXPLORER",
"CLICK_DISPATCH",
"CLICK_EVENT_READBACK",
"POST_CLICK_MARKER_MAXIMUM",
"POST_CLICK_EXPLORER_SURFACE_MATERIALIZED",
"single diagnostic click maximum",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R3_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
