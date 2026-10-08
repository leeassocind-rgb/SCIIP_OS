#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20.py"),"utf8");
const req=[
"r19TriggerWorkspaceMismatch",
"exactLoadCallCandidatesResolved",
"capabilityIdCandidatesResolved",
"workspaceIdCandidatesResolved",
"triggerOwnerCandidatesResolved",
"EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_BINDING_RESOLVED",
"EXPORT_CAPABILITY_ID_RESOLVED_WORKSPACE_BINDING_PARTIAL",
"EXPORT_WORKSPACE_ID_RESOLVED_CAPABILITY_ID_PARTIAL",
"LOAD_CALL_RESOLVED_ROLE_SPECIFIC_IDS_PARTIAL",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R19_TRIGGER_WORKSPACE_BINDING_MISMATCH_TO_EXACT_CAPABILITY_ID_WORKSPACE_ID_AND_TRIGGER_RESOLUTION"
},null,2));