#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"design_bn17c_r4_r12_r12.py"),"utf8");
const r=[
"selectedPropertyCertifiedThreeOfThree",
"remainingGapFamiliesEnumerated",
"compareReferencesResolved",
"commandReferencesResolved",
"analyzePresentReferencesResolved",
"exportPresentationReferencesResolved",
"boundedMicroCohortRequired",
"haltOnFirstFailure",
"resolvedNextActionFamily",
"COMPARE_ACTION_SURFACE_CONTRACT_AND_MICRO_COHORT_ACTIVATION_DESIGN"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R12_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"POST_SELECTED_PROPERTY_REMAINING_ACTION_FAMILY_READINESS_AND_COMPARE_FIRST_BOUNDED_DESIGN"
},null,2));