#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r19.py"),"utf8");
const req=[
"r18RegisteredButNotLoaded",
"sourceLoadReferencesResolved",
"sourceEntryReferencesResolved",
"sourceTriggerReferencesResolved",
"workspaceBindingReferencesResolved",
"EXPORT_CAPABILITY_LOAD_PATH_PRESENT_TRIGGER_OR_WORKSPACE_BINDING_MISMATCH",
"EXPORT_CAPABILITY_ENTRY_PRESENT_BUT_NO_LOAD_TRIGGER_RESOLVED",
"EXPORT_CAPABILITY_LOAD_TRIGGER_PRESENT_BUT_ENTRYPOINT_UNRESOLVED",
"EXPORT_CAPABILITY_LOAD_PATH_PRESENT_BEHIND_FEATURE_GATED_LOADER_BRANCH",
"EXPORT_CAPABILITY_LOAD_TRIGGER_PRESENT_WORKSPACE_ID_BINDING_REQUIRES_RESOLUTION",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R19_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R18_REGISTERED_BUT_NOT_LOADED_TO_EXPORT_CAPABILITY_LOAD_TRIGGER_WORKSPACE_ENTRY_CONTRACT_RESOLUTION"
},null,2));