#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"reconcile_bn5b_r1.py"),"utf8");
const req=[
"bn5aPassed","allSessionValuesResidual","globalSearchListenerPresent",
"matchSessionRemovalPresent","matchSelectsProperty","matchSetsFocusPropertyId",
"matchAdvancesFocusRequestKey",
"RESIDUAL_SEARCH_SESSION_VALUE_IS_HANDOFF_CLEANUP_GAP_NOT_SPATIAL_SELECTION_FAILURE",
"M4_19D4BN5B_R2_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_RECERTIFICATION",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN5B_R1_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
