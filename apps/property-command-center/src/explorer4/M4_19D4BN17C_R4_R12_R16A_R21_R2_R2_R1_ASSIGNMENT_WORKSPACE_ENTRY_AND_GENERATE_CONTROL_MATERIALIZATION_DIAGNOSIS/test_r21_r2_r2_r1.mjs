#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"diagnose_r21_r2_r2_r1.py"),"utf8");
const q=[
"r21R2R2DiagnosticConsumed",
"listingAssignmentProductionHouseImportsInspected",
"listingAssignmentProductionHouseMountSitesInspected",
"sourceAssignmentNavigationControlsInspected",
"liveAssignmentNavigationControlsInventoried",
"exactAssignmentEntryBindingAttempted",
"assignmentEntryInvocationOff",
"ASSIGNMENT_WORKSPACE_MOUNT_OWNER_AND_EXACT_LIVE_ENTRY_CONTROL_RESOLVED",
"ASSIGNMENT_WORKSPACE_MOUNT_OWNER_RESOLVED_LIVE_ENTRY_CONTROL_PARTIAL"
];
for(const x of q){
  if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R21_R2_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R21_R2_R2_ZERO_GENERATE_CONTROL_TO_ASSIGNMENT_WORKSPACE_ENTRY_OWNER_AND_EXACT_LIVE_CONTROL_DIAGNOSIS"
},null,2));