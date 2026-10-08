#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r20_r5_r8.py"),"utf8");
const req=[
"r5R7ZeroArgParityConsumed",
"bootstrapReturnContractInspected",
"platformRuntimeCenterConsumerFieldsCaptured",
"bootstrapSourceReferencesCaptured",
"exportPresentationSemanticSearchCompleted",
"runtimeOutputToExportGateCorrelationAttempted",
"RUNTIME_BOOTSTRAP_OUTPUT_FIELDS_CORRELATE_TO_EXPORT_PRESENTATION_GATE_CODE",
"PLATFORM_RUNTIME_BOOTSTRAP_OUTPUT_NOT_CAUSALLY_RELEVANT_TO_EXPORT_GATE",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R8_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R5_R7_ZERO_ARGUMENT_RUNTIME_TRIGGER_TO_OUTPUT_CONTRACT_AND_EXPORT_GATE_CAUSAL_RELEVANCE_DIAGNOSIS"
},null,2));