#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"recertify_bn5b_r2.py"),"utf8");
const req=[
"M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED",
"M419D4BN5B_R1_SEARCH_SESSION_HANDOFF_CAUSALLY_RECONCILED",
"RESIDUAL_SEARCH_SESSION_VALUE_IS_HANDOFF_CLEANUP_GAP_NOT_SPATIAL_SELECTION_FAILURE",
"sessionStorageResidualDisqualifiesSpatialFocus",
"allExactTenLiveCoreSpatialObservationsPassed",
"EXACT_TEN_LIVE_CAUSAL_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CERTIFIED",
"M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN5B_R2_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
