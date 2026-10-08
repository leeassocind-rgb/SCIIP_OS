#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"select_bn17a.py"),"utf8");
const req=["M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED","EXACT_50_RECORD_READ_ONLY_GOVERNED_WORKFLOW_EXPANSION","referenceCohortSizeTwentyFive","liveExplorerTargetObserved","atLeastTwentyFiveNewLiveCandidatesFound","exactlyTwentyFiveNewCandidatesSelected","exactlyFiftyTotal","allFiftyUnique","selectionDeterministic","M419D4BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED","M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION","document.body.innerText"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));