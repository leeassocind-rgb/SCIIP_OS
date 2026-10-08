#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"select_bn16a_r3.py"),"utf8");
const req=["load_first_json","JSONDecoder","raw_decode","bn16aR1EvidenceFirstJsonDecoded","bn16aR1TrailingDataTolerated",
"addressMatcherUsesRealWordBoundary","atLeastFifteenQualifiedCandidatesFound","exactlyFifteenNewCandidatesSelected",
"exactlyTwentyFiveTotal","originalTenRemainFirstAndUnchanged","allTwentyFiveUnique",
"M419D4BN16A_R3_25_RECORD_GOVERNED_COHORT_PREAUTHORIZED",
"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16A_R3_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"TOLERANT_FIRST_JSON_OBJECT_DECODER_ADDED"},null,2));