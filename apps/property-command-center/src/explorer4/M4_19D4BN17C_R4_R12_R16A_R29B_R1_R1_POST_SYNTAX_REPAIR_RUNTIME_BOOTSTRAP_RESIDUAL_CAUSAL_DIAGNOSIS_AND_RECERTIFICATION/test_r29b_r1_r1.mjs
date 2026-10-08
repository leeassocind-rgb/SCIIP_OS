import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_and_recertify_r29b_r1_r1.py",import.meta.url),"utf8");
const req=[
"SCIIP_APP_HTTP_STATUS_BEFORE",
"SCIIP_APP_BOOTSTRAP_ACTION",
"SCIIP_APP_HTTP_STATUS_AFTER",
"CDP_HTTP_STATUS_AFTER",
"node\",\"--check",
"runnerHashPreservedAcrossRecertification",
"Re-running authoritative R29B runner unchanged",
"Governed data mutation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R1_R1_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
