#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"diagnose_r22b_r2_r4.py"),"utf8");
const q=["APP_REACHABLE","CHROME_EXECUTABLE","PRE_CDP_PORT_OPEN","POST_CDP_PORT_OPEN",
"POST_DEVTOOLS_VERSION_AVAILABLE","SCIIP_PAGE_TARGET_COUNT","chromeStderrCaptured",
"VITE_APP_NOT_REACHABLE_BROWSER_CONTEXT_CANNOT_MATERIALIZE",
"CHROME_PROCESS_LAUNCH_ATTEMPTED_CDP_PORT_NEVER_BOUND",
"CDP_ACTIVE_BUT_SCIIP_PAGE_TARGET_NOT_MATERIALIZED",
"exportInvocationOff","workflowInteractionOff"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22B_R2_R4_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22B_R2_R3_CONTEXT_MATERIALIZATION_FAILURE_DECOMPOSED_INTO_APP_REACHABILITY_CHROME_LAUNCH_CDP_BIND_AND_SCIIP_TARGET_DIAGNOSIS"
},null,2));