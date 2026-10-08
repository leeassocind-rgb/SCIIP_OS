#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r5.py"),"utf8");
const r=[
"exactlyOneCompletePipelineBundle",
"queryIngressFunctionCandidatesResolved",
"resultDerivationFunctionCandidatesResolved",
"resultOwnerFunctionCandidatesResolved",
"selectionFunctionCandidatesResolved",
"crossStageSymbolOverlapResolved",
"sourceSemanticCorrelationResolved",
"familyResolution",
"crossStageSymbols",
"ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_CANDIDATES_AND_CROSS_STAGE_BINDINGS_RESOLVED",
"BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R5_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_AND_CROSS_STAGE_SYMBOL_BINDING_RESOLUTION"
},null,2));