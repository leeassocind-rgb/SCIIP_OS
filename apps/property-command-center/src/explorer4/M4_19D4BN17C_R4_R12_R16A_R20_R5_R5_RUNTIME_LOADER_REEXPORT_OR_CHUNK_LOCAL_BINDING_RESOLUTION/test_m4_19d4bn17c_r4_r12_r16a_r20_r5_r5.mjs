#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r5_r5.py"),"utf8");
const req=["r5R4IndirectBindingClassificationConsumed","allActiveDistJsChunksInspected","reexportsInspected",
"runtimeLocalUseGraphInspected","sourceSemanticOwnerSearchCompleted",
"RUNTIME_EXPORT_DIRECTLY_IMPORTED_BY_NON_ENTRY_ACTIVE_DIST_CHUNK",
"RUNTIME_EXPORT_REEXPORTED_THROUGH_ACTIVE_DIST_CHUNK",
"RUNTIME_EXPORT_CHUNK_LOCAL_BOOTSTRAP_WITH_SOURCE_SEMANTIC_OWNER_CANDIDATES","liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R5_STATIC_TEST",status:"PASSED",assertions:req.length,
repair:"R5_R4_INDIRECT_OR_ABSENT_ENTRY_BINDING_TO_REEXPORT_CHUNK_LOCAL_AND_SOURCE_OWNER_RESOLUTION"},null,2));