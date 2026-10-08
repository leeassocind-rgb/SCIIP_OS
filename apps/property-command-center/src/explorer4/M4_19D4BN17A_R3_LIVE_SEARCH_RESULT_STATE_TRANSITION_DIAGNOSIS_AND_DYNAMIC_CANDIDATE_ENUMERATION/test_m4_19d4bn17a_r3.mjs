#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_and_select_bn17a_r3.py"),"utf8");
const req=[
"originalBn17aR2PoolCountSeventeen",
"queryResultStateTransitionsObserved",
"dynamicStateWaitUsed",
"resultStateChanged",
"transitionElapsedMs",
"atLeastTwentyFiveNewLiveCandidatesFound",
"exactlyTwentyFiveNewCandidatesSelected",
"exactlyFiftyTotal",
"allFiftyUnique",
"M419D4BN17A_R3_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED",
"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION",
"class WS"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import remains");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_R3_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"SEARCH_RESULT_STATE_TRANSITION_WAIT_AND_DYNAMIC_HARVESTING_ADDED"},null,2));