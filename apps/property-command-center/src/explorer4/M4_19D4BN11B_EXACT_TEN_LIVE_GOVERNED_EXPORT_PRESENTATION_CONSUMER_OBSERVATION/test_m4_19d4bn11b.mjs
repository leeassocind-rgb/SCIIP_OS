#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn11b.py"),"utf8");
const req=["BN11A_CERTIFICATION_REQUIRED","External websocket dependency: OFF","exportControlClicked","exportConsumerVisible","presentControlClicked","presentationConsumerVisible","mapVisibleAfterConsumers","LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED","observedCount","M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE","9333","webSocketDebuggerUrl"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN11B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
