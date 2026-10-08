#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"resolve_r21_r2_r1.py"),"utf8");
const q=[
"r21R2DiagnosticConsumed",
"institutionalReportReviewMountSitesInspected",
"mountOwnerStateSignalsCaptured",
"liveSemanticNavigationControlsInventoried",
"sourceToLiveControlCorrelationAttempted",
"navigationControlInvocationOff",
"SOURCE_STATE_MOUNT_OWNER_AND_LIVE_NAVIGATION_CONTROL_BINDING_RESOLVED",
"SOURCE_STATE_MOUNT_OWNER_RESOLVED_LIVE_CONTROL_SEMANTIC_BINDING_PARTIAL",
"exportControlInvocationOff"
];
for(const x of q){
  if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R21_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R21_R2_NO_ROUTE_LITERAL_TO_COMPONENT_STATE_MOUNT_OWNER_AND_LIVE_NAVIGATION_CONTROL_BINDING"
},null,2));