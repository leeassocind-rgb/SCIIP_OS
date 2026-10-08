#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"observe_bn7b.py"),"utf8");
const v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const req=["LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED","COMMAND_SURFACE_NOT_ACTIVATED","COMMAND_CONSUMER_NOT_VISIBLE",
"COMMAND_ACTION_ROUTE_SET_NOT_OBSERVED","propertyAction","marketAction","neighborsAction","compareAction","explainAction",
"M419D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED",
"M4_19D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSURE","chrome-extension://"];
for(const x of req){if(!(t.includes(x)||v.includes(x))){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN7B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
