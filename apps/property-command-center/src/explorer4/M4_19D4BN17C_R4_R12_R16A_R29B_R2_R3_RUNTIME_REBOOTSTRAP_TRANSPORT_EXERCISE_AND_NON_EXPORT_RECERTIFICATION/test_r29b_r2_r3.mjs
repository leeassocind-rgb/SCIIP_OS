import fs from "node:fs";
const s=fs.readFileSync(new URL("./rebootstrap_and_recertify_r29b_r2_r3.py",import.meta.url),"utf8");
const req=[
"SCIIP_APP_HTTP_STATUS_BEFORE",
"SCIIP_APP_BOOTSTRAP_ACTION",
"SCIIP_APP_HTTP_STATUS_AFTER",
"CDP_HTTP_STATUS_AFTER",
"class RawWebSocket",
'this.ws=new RawWebSocket(this.wsUrl);',
'startsWith("HTTP/1.1 101")',
'node","--check',
"runnerHashPreservedAcrossRecertification",
"RAW_WEBSOCKET_TRANSPORT_READY_FOR_LIVE_EXERCISE",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
