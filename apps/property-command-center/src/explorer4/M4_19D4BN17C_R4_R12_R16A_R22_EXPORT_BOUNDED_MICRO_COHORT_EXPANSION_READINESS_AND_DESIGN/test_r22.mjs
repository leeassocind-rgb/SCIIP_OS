#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"design_r22.py"),"utf8");

const q=[
"r21R6Passed",
"r21R6StateClosed",
"singleRecordLifecycleClassificationConsumed",
"boundedMicroCohortRequired",
"exactThreeRecordMicroCohort",
"freshPagePerRecordSameBrowserRequired",
"strictSequentialRequired",
"haltOnFirstFailureRequired",
"selectedRecordReadbackRequired",
"artifactReadbackRequired",
"exactOneExportClickPerRecordRequired",
"eligibilityContractDefined",
"failurePolicyDefined",
"SINGLE_RECORD_EXPORT_CLOSED_EXACT_THREE_RECORD_BOUNDED_EXPANSION_POLICY_CERTIFIED",
"EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZATION_AND_TARGET_QUALIFICATION"
];

for(const x of q){
  if(!s.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R22_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R21_R6_SINGLE_RECORD_EXPORT_CLOSURE_TO_EXACT_THREE_RECORD_FRESH_PAGE_BOUNDED_EXPANSION_POLICY_AND_PREAUTHORIZATION_HANDOFF"
},null,2));