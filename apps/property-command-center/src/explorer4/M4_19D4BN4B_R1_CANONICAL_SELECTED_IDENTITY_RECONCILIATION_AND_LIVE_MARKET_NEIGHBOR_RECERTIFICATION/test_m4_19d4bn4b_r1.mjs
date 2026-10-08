#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"observe_bn4b_r1.py"),"utf8");
const req=["CANONICAL_SELECTED_IDENTITY_NOT_OBSERVED","CANONICAL_IDENTITY_LOST_THROUGH_NEIGHBOR_FLOW","LIVE_MARKET_CONTEXT_AND_NEIGHBOR_CANONICAL_IDENTITY_CONTINUITY_CERTIFIED","2 Musick","13900 Carmenita Rd","M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE","applicationSourceMutation"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN4B_R1_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
