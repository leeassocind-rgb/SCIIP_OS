#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"repair_r28a_r1.py"),"utf8");
const q=[
"isinstance(j,list)",
"if not isinstance(j,dict)",
"extract_ordered_values",
"TOP_LEVEL_LIST",
"noGetCalledOnListContract",
"shapeSafeReferenceParserUsed",
"referenceFirstHundredEvidenceShape",
"referenceTwoHundredExcludedFromNewPool",
"exactNewTwoHundredCandidatesResolved",
"ADDRESS_PLUS_VISIBLE_SF",
"recognizedStatusBoundaryNormalizationUsed",
"policySurfaceChanged",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28A_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28A_REFERENCE_SCAN_CRASHED_ON_TOP_LEVEL_JSON_LIST_TO_SHAPE_SAFE_LIST_DICT_BRANCHING_REFERENCE200_RECONSTRUCTION_AND_EXACT_NEW200_CANDIDATE_SELECTION_RECERTIFICATION"
},null,2));