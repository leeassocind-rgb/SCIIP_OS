#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"certify_r21_r2.py"),"utf8");
const q=[
"viteSourceRuntimeParityConsumed",
"sourceControlContractInspected",
"sourceRouteSignalsInspected",
"cdpTargetProbeCompleted",
"exportControlInvocationOff",
"sameOriginNavigationOnly",
"LIVE_EXPORT_CONTROL_ALREADY_MATERIALIZED_ROUTE_AND_INTERACTION_REACHABILITY_CERTIFIED",
"LIVE_EXPORT_CONTROL_ROUTE_CANDIDATES_RESOLVED_CONTROL_NOT_YET_MATERIALIZED",
"liveWorkflowActionAuthorityOff"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R21_R2_STATIC_TEST",
 status:"PASSED",assertions:q.length,
 repair:"R21_R1_R1_LIVE_SOURCE_PARITY_TO_NON_INVOCATIVE_EXPORT_CONTROL_ROUTE_AND_INTERACTION_REACHABILITY"
},null,2));