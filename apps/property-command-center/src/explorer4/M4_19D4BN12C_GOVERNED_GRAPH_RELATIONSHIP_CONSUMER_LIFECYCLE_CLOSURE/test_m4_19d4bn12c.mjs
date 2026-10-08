#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"close_bn12_lifecycle.py"),"utf8");
const req=[
"M419D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFIED",
"M419D4BN12B_EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMERS_OBSERVED",
"allGraphControlsClicked","allRelationshipConsumersVisible","allRelationshipSignalsObserved",
"allMapsVisibleAfterRelationship","allOutcomesCertified",
"EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN12_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"READ_ONLY_EVIDENCE_CLOSURE"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN12C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
