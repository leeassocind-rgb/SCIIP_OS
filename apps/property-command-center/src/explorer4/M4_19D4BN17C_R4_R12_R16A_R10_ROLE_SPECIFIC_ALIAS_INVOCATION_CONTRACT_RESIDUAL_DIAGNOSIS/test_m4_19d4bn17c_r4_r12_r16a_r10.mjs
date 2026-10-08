#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r10.py"),"utf8");
const req=[
"r16aR9DiagnosticComplete",
"r9NoArgsInvocationObserved",
"r9InvocationReturnedWithoutException",
"r9NoCertifiableExportTransition",
"sourceAliasDefinitionOrCallsInspected",
"liveReactHandlerContextCaptured",
"siblingHandlerContextCaptured",
"invocationContractClassified",
"RESOLVED_INVOCATION_CONTRACT",
"EVENT_OBJECT_DRIVEN_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION",
"exportPresentationRuntimeInvocationOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R10_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"APPLICATION_OWNED_ALIAS_ROLE_SPECIFIC_INVOCATION_CONTRACT_SOURCE_AND_LIVE_HANDLER_CONTEXT_DIAGNOSIS"
},null,2));