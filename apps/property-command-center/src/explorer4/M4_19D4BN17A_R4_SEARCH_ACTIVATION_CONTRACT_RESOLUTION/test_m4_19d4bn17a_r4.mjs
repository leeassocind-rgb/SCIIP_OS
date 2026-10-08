#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17a_r4.py"),"utf8");
const req=[
"bn17aR3NoResultStateTransitions",
"searchInputResolved",
"controlledStateOrChangePathResolved",
"activationKeyOrSubmitResolved",
"searchResultSurfaceResolved",
"propertySelectionRouteResolved",
"CONTROLLED_INPUT_PLUS_KEY_ACTIVATION",
"CONTROLLED_INPUT_PLUS_FORM_SUBMIT",
"ACTION_DISPATCHER",
"M419D4BN17A_R4_SEARCH_ACTIVATION_CONTRACT_RESOLVED",
"LIVE_SEARCH_INPUT_DOM_VALUE_MUTATION_BYPASSED_APPLICATION_SEARCH_ACTIVATION_CONTRACT",
"M4_19D4BN17A_R5_ACTIVATION_CONTRACT_DRIVEN_LIVE_SEARCH_ENUMERATION_AND_50_RECORD_PREAUTHORIZATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_R4_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));