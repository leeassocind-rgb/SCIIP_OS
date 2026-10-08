#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"observe_bn6b_r2.py"),"utf8");
const v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const req=[
"runCommand",
"LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED",
"COMMAND_SURFACE_NOT_ACTIVATED",
"COMPARE_ACTION_NOT_RESOLVED_IN_LIVE_COMMAND_SURFACE",
"COMPARE_CONSUMER_NOT_VISIBLE_AFTER_ACTION",
"M419D4BN6B_R2_EXACT_TEN_LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED",
"M4_19D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE",
"chrome-extension://","Search SCIIP","applicationSourceMutation"
];
for(const x of req){if(!(t.includes(x)||v.includes(x))){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN6B_R2_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
