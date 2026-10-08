#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"certify_bn4a.py"),"utf8");
const req=["POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_PARITY_CERTIFICATION_READY","resolveGovernedMarketContextAnchor","buildGovernedNeighborContext","resolveGovernedNeighborRadiusCollection","resolveGovernedMarketContextCohort","buildGovernedMarketContextRibbonContract","buildGovernedMarketMetricDetailContract","resolveGovernedMarketSpatialSelection","M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED","M4_19D4BN4B_EXACT_TEN_LIVE_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_OBSERVATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN4A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
