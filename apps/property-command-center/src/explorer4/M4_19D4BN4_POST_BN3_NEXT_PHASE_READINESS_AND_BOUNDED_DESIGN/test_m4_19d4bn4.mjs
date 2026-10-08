#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"design_bn4_next_phase.py"),"utf8");
const req=[
"M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED",
"resolveGovernedMarketContextAnchor",
"resolveGovernedMarketContextConsumer",
"resolveGovernedNeighborRadiusCollection",
"buildGovernedMarketMetricDetailContract",
"resolveGovernedMarketSpatialSelection",
"POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_PARITY_CERTIFICATION_READY",
"M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION",
"doNotReopenBN2OrBN3WithoutContradictoryEvidence",
"applicationSourceMutation"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN4_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
