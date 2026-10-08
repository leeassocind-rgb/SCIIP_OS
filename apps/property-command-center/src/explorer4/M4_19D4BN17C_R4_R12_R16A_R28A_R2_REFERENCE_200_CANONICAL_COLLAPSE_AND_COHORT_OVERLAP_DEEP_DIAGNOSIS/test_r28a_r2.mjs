#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r28a_r2.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_COHORT_DIAGNOSIS",
"candidates_first100",
"overlapWithR27DSecond100Count",
"unionUniqueCount",
"withinCohortDuplicateCount",
"looksLikeSameCohortAsR27D",
"looksCompatibleAsDistinctFirst100",
"selectedPriorCandidate",
"bestDistinctCandidate",
"sameCohortCandidateCount",
"distinctCompatibleCandidateCount",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"AUTHORITATIVE_FIRST100_SOURCE_RESOLUTION",
"REFERENCE200_RECORD_LEVEL_GRANULARITY_RECONCILIATION"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28A_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28A_R1_BLOCKED_ON_REFERENCE200_CANONICAL_COLLAPSE_TO_READ_ONLY_FIRST100_SOURCE_INVENTORY_OVERLAP_UNION_AND_INTERNAL_DUPLICATION_DEEP_DIAGNOSIS"
},null,2));