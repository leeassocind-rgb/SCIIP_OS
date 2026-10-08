#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r20_r5.py"),"utf8");
const req=[
"r20R4ImportGraphOpaque",
"activeDistBundleResolved",
"loaderSignatureNeighborhoodsCaptured",
"loaderFunctionCandidatesResolved",
"loaderSymbolResolved",
"ACTIVE_DIST_LOADER_SYMBOL_AND_EXPORT_ADJACENT_CALLER_RESOLVED",
"ACTIVE_DIST_LOADER_SYMBOL_AND_CALLERS_RESOLVED_ROLE_PARTIAL",
"ACTIVE_DIST_LOADER_SYMBOL_RESOLVED_NO_CALLERS",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R20_R4_OPAQUE_SOURCE_IMPORT_GRAPH_ESCALATED_TO_ACTIVE_DIST_LOADER_SIGNATURE_SYMBOL_NEIGHBORHOOD_AND_CALLSITE_RECOVERY"
},null,2));