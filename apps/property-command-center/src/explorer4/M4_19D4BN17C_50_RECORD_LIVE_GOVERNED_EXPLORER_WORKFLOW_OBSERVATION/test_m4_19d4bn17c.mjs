#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn17c.py"),"utf8");
const req=[
"M419D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
"01_GLOBAL_SEARCH","02_SELECTED_PROPERTY","03_PROPERTY_DETAIL_GOVERNED_CONSUMER",
"04_MARKET_CONTEXT_NEIGHBORS","05_SPATIAL_SELECTION_MAP_FOCUS","06_COMPARE","07_COMMAND",
"08_PROPERTY_INTELLIGENCE","09_ANALYZE_PRESENT","10_EXPLAIN_EVIDENCE","11_EXPORT_PRESENTATION",
"12_GRAPH_RELATIONSHIP","13_DEEP_LINK_CONTEXT_RESTORE",
"M419D4BN17C_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVED",
"M4_19D4BN17D_50_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import remains");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));