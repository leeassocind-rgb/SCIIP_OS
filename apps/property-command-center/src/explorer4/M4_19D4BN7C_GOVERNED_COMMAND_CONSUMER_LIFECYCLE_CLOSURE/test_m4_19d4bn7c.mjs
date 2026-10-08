#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_bn7_lifecycle.py"),"utf8");
const req=[
"M419D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFIED",
"M419D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED",
"allCommandRoutesObserved",
"allPropertyRoutesObserved",
"allMarketRoutesObserved",
"allNeighborsRoutesObserved",
"allCompareRoutesObserved",
"allExplainRoutesObserved",
"EXACT_TEN_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN7_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN7C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
