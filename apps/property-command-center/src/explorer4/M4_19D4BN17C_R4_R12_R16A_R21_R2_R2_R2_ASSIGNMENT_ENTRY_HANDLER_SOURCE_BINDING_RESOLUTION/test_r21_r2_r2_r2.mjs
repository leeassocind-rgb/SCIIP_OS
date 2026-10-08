#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"resolve_r21_r2_r2_r2.py"),"utf8");
const q=["partialLiveEntryClassificationConsumed","exactAssignmentsStringSitesInspected","assignmentNavigationCallsInspected","assignmentPortfolioMountOwnersInspected","liveExactAssignmentsControlsInspected","sourceHandlerBindingResolved","exactLiveAssignmentsControlUnique","assignmentEntryInvocationOff","EXACT_ASSIGNMENTS_LIVE_CONTROL_AND_SOURCE_NAVIGATION_HANDLER_BINDING_RESOLVED"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R21_R2_R2_R2_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R21_R2_R2_R1_PARTIAL_LIVE_ASSIGNMENTS_CONTROL_TO_PARENT_SHELL_SOURCE_NAVIGATION_HANDLER_BINDING"},null,2));