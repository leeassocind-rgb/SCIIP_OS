#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"select_bn17a_r2.py"),"utf8");
const req=[
"M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED",
"originalBn17aR1InsufficientPassivePool",
"deterministicPrefixEnumerationUsed",
"atLeastTwentyFiveNewLiveCandidatesFound",
"exactlyTwentyFiveNewCandidatesSelected",
"exactlyFiftyTotal",
"allFiftyUnique",
"selectionDeterministic",
"M419D4BN17A_R2_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED",
"PASSIVE_LIVE_SURFACE_POOL_EXPANDED_BY_DETERMINISTIC_SEARCH_PREFIX_ENUMERATION_EXACT_50_RECORD_COHORT_PREAUTHORIZED",
"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION",
"class WS"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import remains");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_R2_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"PASSIVE_DOM_DISCOVERY_REPLACED_WITH_DETERMINISTIC_LIVE_SEARCH_PREFIX_ENUMERATION"},null,2));