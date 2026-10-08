#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn12.py"),"utf8");
const req=[
"M419D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED",
"EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"GRAPH_RELATIONSHIP",
"DEEP_LINK_CONTEXT_RESTORE",
"explainEvidenceExcludedAsClosed",
"exportPresentationExcludedAsClosed",
"READ_ONLY_ARCHITECTURE_DESIGN",
"applicationSourceMutation",
"governedDataMutation",
"resolvedConsumer",
"POST_BN11_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED",
"M419D4BN12_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN12_STATIC_TEST",
 status:"PASSED",
 assertions:req.length
},null,2));
