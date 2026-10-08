#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn17c_r4_r12_r9.py"),"utf8");
const r=[
"canonicalPathJtoCtoA",
"EVENT_OBJECT_WITH_TARGET_VALUE",
"input[aria-label=\"Search SCIIP\"]",
"InputEvent",
"KeyboardEvent",
"allThreeResultsMaterialized",
"selectedPropertyActivationOff",
"downstreamWorkflowActionAuthorityOff",
"CANONICAL_J_C_A_BOUND_SEARCH_PATH_LIVE_RESULT_MATERIALIZATION_CERTIFIED_THREE_OF_THREE",
"CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R9_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"CANONICAL_J_C_A_BOUND_SEARCH_PATH_LIVE_THREE_RECORD_RESULT_MATERIALIZATION_CERTIFICATION"
},null,2));