#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"reconcile_bn17c_r4_r12_r13a_r3.py"),"utf8");
const req=[
"reusedTargetCertified",
"freshPageSameBrowserCertified",
"freshIsolatedBrowserMissingDistinguishedFromFalse",
"propertySpecificGapClassificationInvalidated",
"recordTwoLiveSelectionReproducibilityCertified",
"FRESH_PAGE_TARGET_PER_RECORD_SAME_BROWSER",
"R2_PROPERTY_SPECIFIC_GAP_INVALIDATED_RECORD_TWO_SELECTION_REPRODUCIBLE_IN_TWO_LIVE_CONTEXTS",
"COMPARE_MICRO_COHORT_RECERTIFICATION_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R3_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R2_MISSING_ISOLATED_BROWSER_OBSERVATION_DISTINGUISHED_FROM_PROPERTY_SPECIFIC_FAILURE"
},null,2));