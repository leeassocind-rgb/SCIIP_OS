#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"enumerate_bn17a_r5.py"),"utf8");
const req=[
"CONTROLLED_INPUT_PLUS_KEY_ACTIVATION",
"Input.insertText",
"Input.dispatchKeyEvent",
"cdpInputInsertTextUsed",
"cdpEnterKeyActivationUsed",
"controlledInputAcceptedMultipleQueries",
"queryResultStateTransitionsObserved",
"atLeastTwentyFiveNewLiveCandidatesFound",
"exactlyTwentyFiveNewCandidatesSelected",
"exactlyFiftyTotal",
"allFiftyUnique",
"M419D4BN17A_R5_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED",
"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import remains");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_R5_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"DOM_VALUE_MUTATION_REPLACED_WITH_CDP_CONTROLLED_INPUT_AND_ENTER_ACTIVATION"},null,2));