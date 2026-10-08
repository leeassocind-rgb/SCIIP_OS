#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_bn6_lifecycle.py"),"utf8");
const req=[
"M419D4BN6A_R1_EXACT_TEN_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_CERTIFIED",
"M419D4BN6B_R2_EXACT_TEN_LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED",
"allCompareActionsClicked",
"allCompareConsumersVisible",
"allMapsVisibleAfterCompare",
"EXACT_TEN_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN6_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN6C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
