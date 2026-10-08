#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r3.py"),"utf8");
const req=[
"r20R2OwnerAmbiguous",
"workspaceLoaderImportAliasesCaptured",
"upstreamLoadWorkspaceCallsCaptured",
"exportAdjacentUpstreamCallsCaptured",
"lexicalOwnerAggregationCompleted",
"EXACT_UPSTREAM_EXPORT_LOADER_OWNER_CAPABILITY_WORKSPACE_BOUND",
"EXACT_UPSTREAM_EXPORT_LOADER_OWNER_AND_CAPABILITY_BOUND_WORKSPACE_PARTIAL",
"EXACT_UPSTREAM_EXPORT_LOADER_OWNER_BOUND_ARGUMENTS_PARTIAL",
"UPSTREAM_EXPORT_LOADER_CALLERS_RESOLVED_OWNER_AMBIGUOUS",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R3_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R20_R2_LOADER_SELF_CALLSITE_REPLACED_BY_UPSTREAM_IMPORT_ALIAS_CALL_GRAPH_AND_LEXICAL_OWNER_CLOSURE"
},null,2));