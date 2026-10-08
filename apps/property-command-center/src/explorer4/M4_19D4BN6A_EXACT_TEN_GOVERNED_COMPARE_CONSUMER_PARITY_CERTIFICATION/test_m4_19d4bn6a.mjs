#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"certify_bn6a.py"),"utf8");
const req=[
"M419D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED",
"POST_SELECTION_COMPARE_CONSUMER_PARITY_CERTIFICATION_READY",
"CompareDock","toggleCompare(property.id)","resolveGovernedSelectedPropertyMapRuntime",
"M419D4BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFIED",
"EXACT_TEN_GOVERNED_COMPARE_CONSUMER_CONTRACT_PARITY_CERTIFIED",
"M4_19D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVATION",
"applicationSourceMutation","networkAuthority"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN6A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
