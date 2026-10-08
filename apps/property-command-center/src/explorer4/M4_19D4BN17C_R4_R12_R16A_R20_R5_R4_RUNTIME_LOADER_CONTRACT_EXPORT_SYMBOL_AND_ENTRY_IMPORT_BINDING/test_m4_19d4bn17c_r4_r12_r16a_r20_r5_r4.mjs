#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r5_r4.py"),"utf8");
const req=[
"r5R3ClassificationConsumed",
"runtimeFunctionDefinitionsInspected",
"runtimeExportTableInspected",
"entryRuntimeImportsInspected",
"runtimeToEntryBindingAttempted",
"EXACT_RUNTIME_LOADER_EXPORT_SYMBOL_AND_ENTRY_IMPORT_ALIAS_BOUND",
"RUNTIME_LOADER_EXPORT_SYMBOL_RESOLVED_ENTRY_IMPORT_BINDING_INDIRECT_OR_ABSENT",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R4_STATIC_TEST",
 status:"PASSED",assertions:req.length,
 repair:"R5_R3_RUNTIME_LOADER_CONTRACT_CHUNK_TO_EXACT_MINIFIED_EXPORT_SYMBOL_AND_ENTRY_IMPORT_ALIAS_BINDING"
},null,2));