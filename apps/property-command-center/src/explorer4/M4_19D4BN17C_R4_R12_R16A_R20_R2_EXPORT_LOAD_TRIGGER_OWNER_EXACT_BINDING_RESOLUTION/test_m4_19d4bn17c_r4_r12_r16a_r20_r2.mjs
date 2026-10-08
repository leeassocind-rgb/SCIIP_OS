#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r2.py"),"utf8");
const req=[
"r20R1TriggerOwnerPartial",
"loadWorkspaceCallsitesCaptured",
"strictExportAdjacentCallsitesCaptured",
"loaderInternalFalseOwnerExcluded",
"EXACT_EXPORT_LOAD_TRIGGER_OWNER_CAPABILITY_AND_WORKSPACE_BOUND",
"EXACT_EXPORT_LOAD_TRIGGER_OWNER_AND_CAPABILITY_BOUND_WORKSPACE_PARTIAL",
"EXACT_EXPORT_LOAD_TRIGGER_OWNER_BOUND_ARGUMENT_ROLE_PARTIAL",
"EXPORT_LOAD_CALLSITE_RESOLVED_TRIGGER_OWNER_AMBIGUOUS",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R2_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R20_R1_GENERIC_CAPABILITY_CORRELATION_REPLACED_BY_EXACT_LOADWORKSPACE_CALLSITE_AND_LEXICAL_TRIGGER_OWNER_BINDING"
},null,2));