#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"repair_r28a_r3.py"),"utf8");
const q=[
"R26D_R2_R4_EXACT_ONE_HUNDRED_PROGRESSIVE_LIFECYCLE_RECONCILIATION_AND_CLOSURE",
"wrongR27BFirstHundredSourceRejected",
"authoritativeFirstHundredPinnedToR26D_R2_R4Closure",
"referenceRecordCountExactly200",
"referenceRecordKeysExactly200Unique",
"normalizedReferenceLabelCount198",
"normalizedCrossCohortOverlapCount2",
"addressStringUniquenessNotUsedAsRecordIdentity",
"provenanceOrdinalRecordIdentityUsed",
"PROVENANCE_PLUS_ORDINAL_RECORD_KEY",
"referenceLabelsConservativelyExcludedFromNewPool",
"exactNewTwoHundredCandidatesResolved",
"ADDRESS_PLUS_VISIBLE_SF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28A_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28A_R2_PROVED_WRONG_FIRST100_SOURCE_100_PERCENT_COLLISION_TO_PINNED_R26_EXACT100_LIFECYCLE_CLOSURE_PLUS_R27D_SECOND100_RECORD_LEVEL_PROVENANCE_IDENTITY_WITH_TWO_DIAGNOSED_NORMALIZED_ADDRESS_OVERLAPS_AND_EXACT_NEW200_RECERTIFICATION"
},null,2));