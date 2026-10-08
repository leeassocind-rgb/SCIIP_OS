import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r2.mjs",import.meta.url),"utf8");
const req=[
"SINGLE_FRESH_PAGE_READ_ONLY_EXPLORER_SETTLE_DIAGNOSIS",
"FIRST_VALID_EXPLORER_SECONDS",
"THREE_CONSECUTIVE_EXPLORER_SAMPLES",
"THREE_SAMPLE_WINDOW_START_SECONDS",
"EXPLORER_SETTLE_WOULD_CERTIFY",
"exactExplorerCount",
"visibleEnabledExplorerCount",
"readyState",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R2_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);
