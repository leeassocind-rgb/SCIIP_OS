#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn15a.py"),"utf8");
const req=[
"BN15_DESIGN_CERTIFICATION_REQUIRED",
"01_GLOBAL_SEARCH","02_SELECTED_PROPERTY","03_PROPERTY_DETAIL_GOVERNED_CONSUMER",
"04_MARKET_CONTEXT_NEIGHBORS","05_SPATIAL_SELECTION_MAP_FOCUS","06_COMPARE","07_COMMAND",
"08_PROPERTY_INTELLIGENCE","09_ANALYZE_PRESENT","10_EXPLAIN_EVIDENCE","11_EXPORT_PRESENTATION",
"12_GRAPH_RELATIONSHIP","13_DEEP_LINK_CONTEXT_RESTORE",
"LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"M419D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"M4_19D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE",
"Synthetic Origin header: OFF","External websocket dependency: OFF"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("Origin: http://127.0.0.1")){console.error("FAIL synthetic Origin present");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN15A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
