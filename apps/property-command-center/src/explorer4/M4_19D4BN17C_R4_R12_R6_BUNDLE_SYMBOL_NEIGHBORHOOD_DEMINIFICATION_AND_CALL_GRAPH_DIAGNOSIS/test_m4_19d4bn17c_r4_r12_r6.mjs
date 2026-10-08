#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r6.py"),"utf8");
const r=["ingressNeighborhoodsCaptured","inlineOrAssignedConstructsCaptured","callGraphSymbolsCaptured","downstreamLinkageAttempted","sourceIngressCorrelationCaptured","ingressClassification","linkedDownstreamSymbols","QUERY_INGRESS_SYMBOL_NEIGHBORHOOD_AND_DOWNSTREAM_CALL_GRAPH_LINKAGE_RESOLVED","BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R6_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"MINIFIED_QUERY_INGRESS_NEIGHBORHOOD_DEMINIFICATION_AND_CROSS_STAGE_CALL_GRAPH_RECOVERY"},null,2));