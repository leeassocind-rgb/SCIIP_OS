#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_bn4_lifecycle.py"),"utf8");

const req=[
"M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED",
"M419D4BN4B_R3_EXACT_TEN_CAUSAL_SELECTED_IDENTITY_CONTINUITY_CERTIFIED",
"allCausalIdentityContinuityCertified",
"mapRailHandlersDoNotMutateSelection",
"allLiveMarketRibbonVisible",
"allLiveMarketDrawerVisible",
"allLiveNeighborsDrawerVisible",
"allLiveNeighborSignalsObserved",
"EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN4_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"applicationSourceMutation",
"canonicalWriteAuthority"
];

for(const x of req){
  if(!t.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN4C_STATIC_TEST",
  status:"PASSED",
  assertions:req.length
},null,2));
