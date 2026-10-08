#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const o=fs.readFileSync(path.join(d,"observe_bn3b.py"),"utf8");
const req=["chrome-extension://","Search SCIIP","validTargets","POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED","2 Musick","13900 Carmenita Rd"];
for(const x of req)if(!(v.includes(x)||o.includes(x))){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN3B_R1_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
