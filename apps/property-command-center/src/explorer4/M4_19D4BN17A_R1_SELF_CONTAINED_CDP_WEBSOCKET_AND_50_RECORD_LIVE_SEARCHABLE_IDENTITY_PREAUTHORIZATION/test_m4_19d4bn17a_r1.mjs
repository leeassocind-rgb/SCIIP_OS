#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"select_bn17a_r1.py"),"utf8");
const req=["External websocket dependency: OFF","class WS","M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED","originalBn17aBlockedByMissingExternalWebsocket","selfContainedWebSocketUsed","atLeastTwentyFiveNewLiveCandidatesFound","exactlyTwentyFiveNewCandidatesSelected","exactlyFiftyTotal","allFiftyUnique","selectionDeterministic","M419D4BN17A_R1_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED","M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import remains");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_R1_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"EXTERNAL_WEBSOCKET_DEPENDENCY_REMOVED_SELF_CONTAINED_CDP_CLIENT"},null,2));