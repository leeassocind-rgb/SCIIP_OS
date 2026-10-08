import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r1.mjs",import.meta.url),"utf8");
const req=[
"EXIT13_SOURCE_HIT_COUNT",
"FRESH_PAGE_RESPONSE_URL",
"IMMEDIATE_URL",
"Page.navigate",
"FINAL_URL",
"FINAL_EXPLORER_COUNT",
"ENDPOINT_CREATED_APP_URL",
"EXPLICIT_NAVIGATE_REACHED_APP",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
