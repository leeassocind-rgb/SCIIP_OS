#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn13b.py"),"utf8");
const req=["BN13A_CERTIFICATION_REQUIRED","Synthetic Origin header: OFF","WebSocket handshake:","deepLinkSearchObserved","urlRestored","postRestorePropertyVisible","postRestoreExplorerMounted","mapVisibleAfterRestore","LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVED","M419D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMERS_OBSERVED","M4_19D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSURE","External websocket dependency: OFF"];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
if(t.includes("Origin: http://127.0.0.1")){console.error("FAIL synthetic Origin present");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN13B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
