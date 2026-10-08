#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"observe_bn12b.py"),"utf8");
const req=[
"BN12A_CERTIFICATION_REQUIRED","Synthetic Origin header: OFF","WebSocket handshake:",
"graphControlClicked","relationshipConsumerVisible","relationshipSignalCount",
"mapVisibleAfterRelationship","graphDescriptor",
"LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_OBSERVED",
"M419D4BN12B_EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMERS_OBSERVED",
"M4_19D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE",
"External websocket dependency: OFF"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("Origin: http://127.0.0.1")){console.error("FAIL synthetic Origin present");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN12B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
