import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r1.mjs",import.meta.url),"utf8");
const req=[
"SINGLE_FRESH_PAGE_READ_ONLY_CDP_TRANSPORT_PROBE",
"FRESH_PAGE_PUT_STATUS",
"WEBSOCKET_HANDSHAKE_CERTIFIED",
"RUNTIME_ENABLE_CERTIFIED",
"PAGE_ENABLE_CERTIFIED",
"RUNTIME_EVALUATE_CERTIFIED",
"PROBE_CDP_COMMAND_TIMEOUT",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R1_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
