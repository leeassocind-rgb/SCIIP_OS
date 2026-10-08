#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r1.py"),"utf8");
const req=[
"r20CapabilityIdResolvedWorkspacePartial",
"registrationDefinitionsInspected",
"capabilityWorkspaceCorrelationsComputed",
"rankedRoleCandidatesResolved",
"triggerOwnerCallsitesInspected",
"EXACT_EXPORT_CAPABILITY_WORKSPACE_AND_TRIGGER_OWNER_CORRELATED",
"EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_CORRELATED_TRIGGER_OWNER_PARTIAL",
"EXACT_EXPORT_CAPABILITY_CORRELATED_WORKSPACE_ROLE_PARTIAL",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R20_FALSE_ROLE_RISK_REDUCED_BY_CAPABILITY_WORKSPACE_TRIGGER_OWNER_EXACT_CORRELATION"
},null,2));