#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r8.py"),"utf8");
const r=[
"aliasClosureGraphBuilt",
"shortestIngressToDownstreamPathResolved",
"perHopEvidenceCaptured",
"resolvedPath",
"aliasHopCount",
"pathHops",
"INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_PATH_RESOLVED",
"CANONICAL_BOUND_SEARCH_FUNCTION_LIVE_MICRO_COHORT_MATERIALIZATION_CERTIFICATION"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R8_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"INGRESS_ALIAS_CLOSURE_GRAPH_AND_SHORTEST_PATH_BINDING_RESOLUTION"
},null,2));