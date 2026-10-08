#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn11.py"),"utf8");
const req=[
"M419D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED",
"EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"DEEP_LINK_CONTEXT_RESTORE","GRAPH_RELATIONSHIP","EXPORT_PRESENTATION",
"explainEvidenceExcludedAsClosed","READ_ONLY_ARCHITECTURE_DESIGN",
"applicationSourceMutation","governedDataMutation","resolvedConsumer",
"POST_BN10_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED",
"M419D4BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN11_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
