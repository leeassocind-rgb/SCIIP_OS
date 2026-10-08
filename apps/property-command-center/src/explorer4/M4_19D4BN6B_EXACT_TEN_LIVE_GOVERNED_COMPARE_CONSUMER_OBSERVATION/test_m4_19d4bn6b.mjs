#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"observe_bn6b.py"),"utf8");
const v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const req=[
"2 Musick","13900 Carmenita Rd",
"LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVED",
"COMPARE_CONTROL_NOT_FOUND","COMPARE_CONSUMER_NOT_VISIBLE",
"M419D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVED",
"M4_19D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE",
"chrome-extension://","Search SCIIP","applicationSourceMutation"
];
for(const x of req){if(!(t.includes(x)||v.includes(x))){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN6B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
