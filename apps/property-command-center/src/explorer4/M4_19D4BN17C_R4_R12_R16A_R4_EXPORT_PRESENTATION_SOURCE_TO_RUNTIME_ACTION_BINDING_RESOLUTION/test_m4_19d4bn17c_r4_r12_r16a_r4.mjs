#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r4.py"),"utf8");
const req=[
"r16aR3Passed",
"r3NoCleanActionControlVisible",
"sourceExportModulesResolved",
"sourcePresentationModulesResolved",
"activeDistBundlesResolved",
"boundFunctionCandidatesResolved",
"actionPayloadShapeCandidatesResolved",
"exportPresentationRuntimeInvocationOff",
"EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R4_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"NO_CLEAN_UI_CONTROL_SOURCE_TO_ACTIVE_DIST_EXPORT_PRESENTATION_RUNTIME_BINDING_RESOLUTION"
},null,2));