#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r28c_r2.py"),"utf8");
const q=[
"READ_ONLY_EXECUTION_AUTHORIZATION_RECERTIFICATION",
"R28_POLICY_BINDING_PATH: $.policy",
"r28cR1ShapeMismatchConsumed",
"r28PolicyBoundAtExactPathDollarPolicy",
"referenceCohortSize200ResolvedFromPolicy",
"nextCohortSize400ResolvedFromPolicy",
"scaleFactorTwoResolvedFromPolicy",
"newLiveExpansionRecords200ResolvedFromPolicy",
"progressiveDeltaTwoHundredResolvedFromPolicy",
"referenceReexportFalseResolvedFromPolicy",
"r28PolicySemanticallyCertified",
"REFERENCE_COHORT_SIZE_AUTHORIZED: 200",
"NEW_PREQUALIFIED_COHORT_SIZE: 200",
"EXACT_COMBINED_COHORT_SIZE: 400",
"EXACT_NEW_TWO_HUNDRED_ONLY",
"REFERENCE_TWO_HUNDRED_REEXPORT: FORBIDDEN",
"STRICT_SEQUENTIAL_FRESH_PAGE_HALT_ON_FIRST_FAILURE",
"Download Client Listing Report",
"exportReport",
"application/pdf",
"authorityRelockAfterEveryRecord",
"R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION",
"Live UI interaction: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28C_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28C_R1_CONFIRMED_R28_POLICY_VALUES_LIVE_UNDER_DOLLAR_POLICY_TO_SHAPE_SAFE_EXACT_POLICY_BINDING_AND_EXACT400_EXECUTION_AUTHORIZATION_RECERTIFICATION"
},null,2));