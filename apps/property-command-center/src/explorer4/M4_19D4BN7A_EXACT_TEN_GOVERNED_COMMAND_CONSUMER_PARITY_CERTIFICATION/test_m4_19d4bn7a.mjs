#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"certify_bn7a.py"),"utf8");
const req=["M419D4BN7_COMMAND_CONSUMER_READINESS_CERTIFIED","resolveGovernedSelectedPropertyMapRuntime",
"governedSelectedMapRuntime","ExplorerCommandPalette","runCommand","propertyRoutePresent",
"marketRoutePresent","neighborsRoutePresent","compareRoutePresent","explainRoutePresent",
"M419D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFIED",
"M4_19D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVATION"];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN7A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
