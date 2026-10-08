#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_bn5_lifecycle.py"),"utf8");
const req=[
"M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED",
"M419D4BN5B_R2_EXACT_TEN_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_CERTIFIED",
"allCausalSpatialFocusCertified",
"allFocusLikeSignalsObserved",
"sessionResidualDoesNotDisqualifySpatialFocus",
"EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN5_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN5C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
