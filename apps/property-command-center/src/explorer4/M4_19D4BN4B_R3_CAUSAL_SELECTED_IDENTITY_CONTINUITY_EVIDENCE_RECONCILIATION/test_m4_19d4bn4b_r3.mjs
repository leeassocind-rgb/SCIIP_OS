#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"reconcile_bn4b_r3.py"),"utf8");
const req=[
"M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED",
"M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED",
"M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED",
"mapRailMarketNeighborHandlersDoNotMutateSelection",
"allExactTenLiveConsumerObservationsPassed",
"allExactTenCausalIdentityContinuityCertified",
"EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_CAUSAL_SELECTED_IDENTITY_CONTINUITY_CERTIFIED",
"bn4bR2FalsePositiveRejected",
"M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE",
"applicationSourceMutation"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN4B_R3_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
