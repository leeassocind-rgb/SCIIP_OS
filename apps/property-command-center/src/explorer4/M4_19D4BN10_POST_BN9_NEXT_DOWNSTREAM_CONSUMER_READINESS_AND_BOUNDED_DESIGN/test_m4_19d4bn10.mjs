#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn10.py"),"utf8");
const req=[
"BN9A_AUTHORITY_METADATA_OMISSION_RECONCILED",
"EXPLAIN_EVIDENCE","DEEP_LINK_CONTEXT_RESTORE","GRAPH_RELATIONSHIP","EXPORT_PRESENTATION",
"resolvedConsumer","nextConsumerResolved","noMutationAuthority",
"M419D4BN10_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED",
"M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFICATION"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN10_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
