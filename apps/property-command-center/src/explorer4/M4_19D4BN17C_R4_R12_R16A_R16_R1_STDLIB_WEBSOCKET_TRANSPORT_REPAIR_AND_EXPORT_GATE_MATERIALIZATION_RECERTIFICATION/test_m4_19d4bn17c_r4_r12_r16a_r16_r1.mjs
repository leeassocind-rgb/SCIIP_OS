#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r16a_r16_r1.py"),"utf8");
const req=["class WS:","socket.create_connection","Sec-WebSocket-Key","liveExportControlMaterialized","EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_AND_WORKSPACE_STATE"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import retained");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R16_R1_STATIC_TEST",status:"PASSED",assertions:6,repair:"REMOVE_UNDECLARED_WEBSOCKET_CLIENT_DEPENDENCY_USE_STDLIB_RAW_CDP_TRANSPORT"},null,2));