#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"observe_bn4b.py"),"utf8"),v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const req=["2 Musick","13900 Carmenita Rd","LIVE_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CONSUMERS_OBSERVED","MARKET_CONTEXT_RIBBON_NOT_VISIBLE","MARKET_DRAWER_NOT_VISIBLE","NEIGHBORS_DRAWER_NOT_VISIBLE","M419D4BN4B_EXACT_TEN_LIVE_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CONSUMERS_OBSERVED","M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE","chrome-extension://","Search SCIIP"];
for(const x of req)if(!(t.includes(x)||v.includes(x))){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN4B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
