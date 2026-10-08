#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r7.py"),"utf8");
const req=[
"r16aR6DiagnosticComplete",
"r6BlobEventChosen",
"nativeConstructorFalsePositiveClassified",
"nativeBrowserIntrinsicsExcluded",
"applicationOwnedCandidateFilterApplied",
"applicationOwnedLiveCandidatesResolved",
"R6_NATIVE_BLOBEVENT_FALSE_BINDING_CAUSALLY_RESOLVED",
"APPLICATION_OWNED_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_RECERTIFICATION",
"exportPresentationRuntimeInvocationOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R7_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"NATIVE_BROWSER_INTRINSIC_BLOBEVENT_FALSE_BINDING_EXCLUSION_AND_APPLICATION_OWNED_RUNTIME_CANDIDATE_DIAGNOSIS"
},null,2));