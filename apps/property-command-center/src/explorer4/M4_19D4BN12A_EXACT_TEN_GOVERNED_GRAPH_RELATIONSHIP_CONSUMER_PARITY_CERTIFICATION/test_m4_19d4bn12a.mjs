#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"certify_bn12a.py"),"utf8");
const req=[
"M419D4BN12_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED",
"GRAPH_RELATIONSHIP","exactTenCohort","selectedPropertyBoundaryPresent",
"graphConsumerPresent","relationshipConsumerPresent","propertyContextConsumptionPresent",
"relationshipSurfacePresent","noMutationAuthority",
"M419D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFIED",
"EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_CONTRACT_PARITY_CERTIFIED",
"M4_19D4BN12B_EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_OBSERVATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN12A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
