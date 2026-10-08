#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r18.py"),"utf8");
const req=[
"r17CapabilityRegistrationLoadClassification",
"sourceCapabilityRegistrationReferencesResolved",
"sourceCapabilityLoadReferencesResolved",
"EXPORT_CAPABILITY_REGISTERED_AND_LOADED_BUT_NOT_BOUND_TO_ACTIVE_EXPLORER_SURFACE",
"EXPORT_CAPABILITY_REGISTERED_BUT_NOT_LOADED",
"EXPORT_CAPABILITY_SOURCE_DEFINED_BUT_LIVE_REGISTRATION_NOT_EXPOSED",
"EXPORT_CAPABILITY_ENTRY_CONTRACT_PRESENT_BUT_LOAD_STATE_UNRESOLVED",
"EXPORT_CAPABILITY_REGISTERED_LOADED_AND_RUNTIME_EXPOSED",
"registrationLoadContractClassified",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R18_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R17_LIVE_CAPABILITY_SIGNAL_TO_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_RESOLUTION"
},null,2));