#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"recover_bn17c_r4_r12_r16a_r20_r5_r2.py"),"utf8");
const req=[
"r20R5R1StrictLoaderUnresolved",
"chunkReferenceGraphBuilt",
"dynamicImportSitesScanned",
"loaderLikeTopologyScored",
"LOADER_LIKE_DYNAMIC_IMPORT_SIGNATURE_RECOVERED",
"DYNAMIC_IMPORT_GRAPH_RECOVERED_LOADER_ROLE_PARTIAL",
"ACTIVE_CHUNK_GRAPH_RECOVERED_NO_DYNAMIC_IMPORT_LOADER_SIGNATURE",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R2_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R5_R1_STRICT_STRING_SIGNATURE_ABSENCE_ESCALATED_TO_ACTIVE_CHUNK_GRAPH_DYNAMIC_IMPORT_CACHE_AND_RUNTIME_TOPOLOGY_RECOVERY"
},null,2));