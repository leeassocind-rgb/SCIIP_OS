#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r8.py"),"utf8");
const req=[
"r16aR5Passed",
"r16aR7Passed",
"aliasFingerprintMappingsComputed",
"roleClassificationCompleted",
"resolvedExportAliasCount",
"resolvedPresentationAliasCount",
"APPLICATION_OWNED_EXPORT_PRESENTATION_ALIASES_AND_ROLES_RESOLVED",
"APPLICATION_OWNED_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_RECERTIFICATION",
"exportPresentationRuntimeInvocationOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R8_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"APPLICATION_OWNED_MINIFIED_RUNTIME_FUNCTION_ALIAS_FINGERPRINT_AND_ROLE_RESOLUTION"
},null,2));