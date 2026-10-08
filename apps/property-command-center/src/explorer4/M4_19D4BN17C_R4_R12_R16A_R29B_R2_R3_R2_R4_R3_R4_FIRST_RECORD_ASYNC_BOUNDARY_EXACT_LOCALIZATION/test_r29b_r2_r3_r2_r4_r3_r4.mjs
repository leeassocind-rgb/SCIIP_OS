import fs from "node:fs";
const s=fs.readFileSync(new URL("./localize_r29b_r2_r3_r2_r4_r3_r4.py",import.meta.url),"utf8");
const req=[
"FIRST_RECORD_ASYNC_REGION_REACHED_SYNCHRONOUS_CONTROL_FLOW_CERTIFIED",
"createFreshPage",
"R29B_CFP_ENTRY",
"R29B_CFP_AWAIT_BEGIN:",
"R29B_CFP_AWAIT_END:",
"R29B_CFP_RETURN:",
"LOCALIZED_BOUNDARY:",
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
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R4_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);