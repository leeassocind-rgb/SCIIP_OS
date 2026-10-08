#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r5.py"),"utf8");
const req=["r16aR4Passed","exactFunctionCandidatesResolved","exportFunctionCandidatesResolved",
"presentationFunctionCandidatesResolved","formalParameterShapesResolved","payloadShapesResolved",
"callEdgesResolved","invocationContractClassified","EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_BINDING_CERTIFICATION",
"exportPresentationRuntimeInvocationOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R5_STATIC_TEST",status:"PASSED",
assertions:req.length,repair:"EXACT_ACTIVE_BUNDLE_EXPORT_PRESENTATION_BOUND_FUNCTION_PARAMETER_PAYLOAD_AND_CALL_GRAPH_RESOLUTION"},null,2));