#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r16a_r20_r5_r1.py"),"utf8");
const req=["bareEsModuleExportSyntaxExcluded","lifecycleInitializerPenaltyApplied","strictLoaderSemanticsRequired",
"R5_O_G_PAIR_REJECTED_AS_CAPABILITY_LIFECYCLE_BOOTSTRAP_FALSE_POSITIVE",
"ACTIVE_CHUNK_GRAPH_AND_LOADER_SIGNATURE_RECOVERY","applicationMutationOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R1_STATIC_TEST",status:"PASSED",
assertions:req.length,repair:"R5_BARE_ES_MODULE_EXPORT_TOKEN_AND_CAPABILITY_BOOTSTRAP_FALSE_POSITIVE_EXCLUSION"},null,2));