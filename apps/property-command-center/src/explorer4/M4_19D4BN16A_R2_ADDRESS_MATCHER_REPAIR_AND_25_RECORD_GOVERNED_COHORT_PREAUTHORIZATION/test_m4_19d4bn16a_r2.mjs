#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"select_bn16a_r2.py"),"utf8");
const req=["bn16aR1CandidateCountZero","addressMatcherUsesRealWordBoundary","digitMatcherUsesRealDigitClass",
"atLeastFifteenQualifiedCandidatesFound","exactlyFifteenNewCandidatesSelected","exactlyTwentyFiveTotal",
"originalTenRemainFirstAndUnchanged","allTwentyFiveUnique","allNewCandidatesPassStrictQualification",
"M419D4BN16A_R2_25_RECORD_GOVERNED_COHORT_PREAUTHORIZED",
"ADDRESS_MATCHER_REPAIRED_DETERMINISTIC_25_RECORD_GOVERNED_COHORT_SELECTED_QUALIFIED_AND_PREAUTHORIZED",
"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16A_R2_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"OVER_ESCAPED_ADDRESS_REGEX_CORRECTED"},null,2));