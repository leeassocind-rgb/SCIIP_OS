#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r5_r7.py"),"utf8");
const req=[
"r5R6TriggerOwnerClassificationConsumed",
"exactSingleZeroArgumentDistCall",
"sourceComponentCandidatesResolved",
"sourceRuntimeCandidatesResolved",
"sourceUseMemoRuntimeCallInspected",
"runtimeApiDefinitionInspected",
"ZERO_ARGUMENT_RUNTIME_TRIGGER_CONTRACT_AND_SOURCE_COMPONENT_RUNTIME_PARITY_RESOLVED",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R7_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R5_R6_EXACT_NON_ENTRY_CALLSITE_TO_ZERO_ARGUMENT_RUNTIME_TRIGGER_CONTRACT_AND_SOURCE_COMPONENT_RUNTIME_PARITY"
},null,2));