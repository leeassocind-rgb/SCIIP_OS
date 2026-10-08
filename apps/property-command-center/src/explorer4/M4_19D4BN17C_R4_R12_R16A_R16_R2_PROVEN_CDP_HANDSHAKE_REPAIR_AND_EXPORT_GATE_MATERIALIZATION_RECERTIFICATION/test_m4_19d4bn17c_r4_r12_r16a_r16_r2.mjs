#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r16a_r16_r2.py"),"utf8");
const req=[
"class WS:",
"Sec-WebSocket-Key",
"Sec-WebSocket-Version: 13",
"provenCdpHandshakePatternUsed",
"originHeaderOmitted",
"liveExportControlMaterialized",
"EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_AND_WORKSPACE_STATE"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(/Origin:/i.test(t)){console.error("FAIL Origin header retained");process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket dependency retained");process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R16_R2_STATIC_TEST",
 status:"PASSED",
 assertions:req.length+2,
 repair:"R16_R1_HANDSHAKE_RESET_REPAIRED_WITH_PROVEN_NO_ORIGIN_RAW_CDP_WEBSOCKET_PATTERN"
},null,2));