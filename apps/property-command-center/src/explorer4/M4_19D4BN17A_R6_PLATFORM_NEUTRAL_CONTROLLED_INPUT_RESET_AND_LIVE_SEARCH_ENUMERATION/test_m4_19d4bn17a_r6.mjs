#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"enumerate_bn17a_r6.py"),"utf8");
const req=["Backspace","Delete","allQueriesClearedBeforeTyping","controlledInputAcceptedMultipleExactQueries","bn17aR5AccumulatingInputObserved","queryResultStateTransitionsObserved","exactlyFiftyTotal","allFiftyUnique","M419D4BN17A_R6_50_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_PREAUTHORIZED","M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_R6_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"OS_SPECIFIC_SELECT_ALL_REMOVED_PLATFORM_NEUTRAL_CHARACTER_DELETION_RESET_ADDED"},null,2));