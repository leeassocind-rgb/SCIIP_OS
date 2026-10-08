#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"observe_bn3b.py"),"utf8");
const req=["2 Musick","13900 Carmenita Rd","POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED",
"PROPERTY_DRAWER_CONTROL_NOT_FOUND","PROPERTY_DRAWER_NOT_VISIBLE",
"POST_SELECTION_PROPERTY_VISIBILITY_NOT_PROVEN",
"M419D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED",
"M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE",
"applicationSourceMutation","pixelEvidence"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN3B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
