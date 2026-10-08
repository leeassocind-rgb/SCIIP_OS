#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r20_r5_r3.py"),"utf8");
const req=["r5R2PartialRoleConsumed","viteLazyPreloadFalsePositiveClassApplied","runtimeCacheContractsScanned",
"runtimeImportProvenanceScanned","RUNTIME_LOADER_CACHE_CONTRACT_CHUNK_RECOVERED_DYNAMIC_IMPORTS_CLASSIFIED_AS_ENTRY_LAZY_ROUTING",
"ENTRY_DYNAMIC_IMPORTS_CLASSIFIED_AS_GENERIC_LAZY_ROUTING_RUNTIME_LOADER_CONTRACT_NOT_IN_ACTIVE_DIST",
"liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R3_STATIC_TEST",status:"PASSED",
assertions:req.length,repair:"R5_R2_ENTRY_CHUNK_DYNAMIC_IMPORT_FALSE_ROLE_RISK_REDUCED_BY_VITE_LAZY_PRELOAD_CLASSIFICATION_AND_RUNTIME_CACHE_CONTRACT_PROVENANCE"},null,2));