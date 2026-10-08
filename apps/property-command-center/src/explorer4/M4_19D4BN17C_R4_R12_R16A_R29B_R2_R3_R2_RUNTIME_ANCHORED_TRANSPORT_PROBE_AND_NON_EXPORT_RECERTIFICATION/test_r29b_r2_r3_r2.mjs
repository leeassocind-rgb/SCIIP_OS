import fs from "node:fs";
const s=fs.readFileSync(new URL("./runtime_anchored_probe_r29b_r2_r3_r2.mjs",import.meta.url),"utf8");
const req=[
"STARTED_PROPERTY_COMMAND_CENTER_RUNTIME",
"CDP_HTTP_STATUS",
"FRESH_PAGE_PUT_STATUS",
"WEBSOCKET_HANDSHAKE_CERTIFIED",
"RUNTIME_ENABLE_CERTIFIED",
"PAGE_ENABLE_CERTIFIED",
"RUNTIME_EVALUATE_CERTIFIED",
"TRANSPORT_PROBE_CERTIFIED",
"Re-running authoritative R29B runner unchanged",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
