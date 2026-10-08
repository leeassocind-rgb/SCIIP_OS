#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_bn3_lifecycle.py"),"utf8");
const req=[
"M419D4BN3A_EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_PARITY_CERTIFIED",
"M419D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED",
"POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED",
"allDrawersVisible","allMapsVisible","allIntelligenceObserved",
"EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN3_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"applicationSourceMutation","canonicalWriteAuthority"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN3C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
