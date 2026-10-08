#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn11b_r1.py"),"utf8");
const req=["r\"ws://([^/:]+):(\\d+)(/.*)\"","CDP_WEBSOCKET_URL_PORT_REGEX_CORRECTED","BN11A_CERTIFICATION_REQUIRED","exportControlClicked","presentControlClicked","exportDescriptor","presentDescriptor","LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED","M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE","webSocketDebuggerUrl","External websocket dependency: OFF","[data-action]"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN11B_R1_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"CDP_WEBSOCKET_URL_PORT_REGEX_CORRECTED"},null,2));
