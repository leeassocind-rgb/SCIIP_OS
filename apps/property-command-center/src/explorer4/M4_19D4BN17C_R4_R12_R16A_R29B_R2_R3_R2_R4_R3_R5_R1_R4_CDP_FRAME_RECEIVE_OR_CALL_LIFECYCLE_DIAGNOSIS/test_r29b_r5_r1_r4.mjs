import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r5_r1_r4.py",import.meta.url),"utf8");
const req=[
"CDP timeout Runtime.enable",
"DATA_LISTENER",
"FRAME_PARSE",
"JSON_PARSE",
"PENDING_GET",
"RESOLVE_CALL",
"POST_UPGRADE_RECEIVE_LISTENER_PRESENT",
"RFC6455_SERVER_FRAME_DECODER_PRESENT",
"CDP_JSON_PARSE_PRESENT",
"PENDING_PROMISE_RESOLUTION_PRESENT",
"Application source mutation: OFF",
"Governed data mutation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R4_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);