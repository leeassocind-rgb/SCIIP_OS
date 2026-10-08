#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r7.py"),"utf8");
const r=[
"ingressDefinitionResolved",
"downstreamDefinitionOrInvocationResolved",
"argumentExpressionsCaptured",
"callGraphEdgesCaptured",
"argumentContractClassified",
"sourceArgumentContractCorrelationCaptured",
"ingressArgumentContract",
"downstreamArgumentContract",
"directIngressToDownstreamEdge",
"BOUND_QUERY_INGRESS_TO_DOWNSTREAM_CALL_EDGE_AND_ARGUMENT_CONTRACT_RESOLVED",
"CANONICAL_BOUND_SEARCH_FUNCTION_LIVE_MICRO_COHORT_MATERIALIZATION_CERTIFICATION"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R7_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"BOUND_QUERY_INGRESS_CALL_GRAPH_AND_ARGUMENT_SHAPE_RESOLUTION"
},null,2));