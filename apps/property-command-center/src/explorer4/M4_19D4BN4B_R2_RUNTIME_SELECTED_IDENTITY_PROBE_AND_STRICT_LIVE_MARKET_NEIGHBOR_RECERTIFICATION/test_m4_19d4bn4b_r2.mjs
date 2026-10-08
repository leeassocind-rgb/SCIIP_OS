#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"observe_bn4b_r2.py"),"utf8");
const req=["STRICT_SELECTED_IDENTITY_NOT_PROVEN","stableAnchors","sharedMeaningfulQueryTokens","LIVE_MARKET_CONTEXT_AND_NEIGHBOR_STRICT_SELECTED_IDENTITY_CONTINUITY_CERTIFIED","2 Musick","13900 Carmenita Rd","M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE","applicationSourceMutation"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN4B_R2_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
