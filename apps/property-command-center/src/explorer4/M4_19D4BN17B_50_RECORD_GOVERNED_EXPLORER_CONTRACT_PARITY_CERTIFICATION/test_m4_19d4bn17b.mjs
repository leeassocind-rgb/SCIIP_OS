#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"certify_bn17b.py"),"utf8");
const req=[
"bn17aR8Passed",
"M419D4BN17A_R8_50_RECORD_CANONICAL_LIVE_SEARCHABLE_IDENTITY_COHORT_PREAUTHORIZED",
"bn16bPassed",
"exactFiftyCount",
"exactlyTwentyFiveExpansionRecords",
"allFiftyUnique",
"allCapabilitiesPresent",
"allFiftyContractParityCertified",
"M419D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
"EXACT_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
"M4_19D4BN17C_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION",
"deepLinkRestorePresent"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));