#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r4.py"),"utf8");
const req=[
"r20R3NoUpstreamCallers",
"loaderSymbolSeedCaptured",
"aliasOrReexportGraphCaptured",
"DEMINIFIED_UPSTREAM_EXPORT_LOADER_OWNER_RESOLVED",
"DEMINIFIED_EXPORT_LOADER_CALLS_RESOLVED_OWNER_PARTIAL",
"DEMINIFIED_LOADER_ALIAS_CALLS_RESOLVED_NO_EXPORT_ROLE",
"LOADER_ALIAS_GRAPH_RESOLVED_NO_CALLSITE",
"WORKSPACE_LOADER_IMPORT_GRAPH_STILL_OPAQUE",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R4_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R20_R3_ZERO_DIRECT_IMPORTS_ESCALATED_TO_REEXPORT_ALIAS_AND_BUNDLED_SYMBOL_IMPORT_GRAPH_DEMINIFICATION"
},null,2));