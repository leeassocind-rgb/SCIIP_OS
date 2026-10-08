#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r9_r1.py"),"utf8");
const r=[
"bootstrap_target",
"--remote-debugging-port=",
"--user-data-dir=",
"/tmp/sciip-explorer-cdp-profile",
"cdpTargetAvailableOrSelfBootstrapped",
"canonicalPathJtoCtoA",
"allThreeResultsMaterialized",
"selectedPropertyActivationOff",
"downstreamWorkflowActionAuthorityOff",
"SELF_BOOTSTRAPPED_OR_REUSED_CDP_CANONICAL_J_C_A_SEARCH_MATERIALIZATION_CERTIFIED_THREE_OF_THREE"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R9_R1_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"SELF_BOOTSTRAPPING_ISOLATED_CHROME_CDP_TARGET_PLUS_CANONICAL_SEARCH_LIVE_RECERTIFICATION"
},null,2));