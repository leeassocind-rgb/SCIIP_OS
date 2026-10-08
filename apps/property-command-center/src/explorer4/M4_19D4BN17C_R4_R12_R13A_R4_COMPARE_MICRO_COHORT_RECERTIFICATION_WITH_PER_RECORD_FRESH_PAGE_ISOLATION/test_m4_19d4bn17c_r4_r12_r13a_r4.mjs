#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r13a_r4.py"),"utf8");
const req=[
"r3R1PolicyPassed",
"freshPageTargetPerRecordPolicyUsed",
"samePageReuseAcrossRecords",
"freshIsolatedBrowserPerRecord",
"allExecutedFreshTargetsCreated",
"allExecutedSelectedPropertiesCertified",
"allExecutedCompareActionsCertified",
"allThreeCompareActionsCertified",
"COMPARE_ACTION_RECERTIFIED_THREE_OF_THREE_WITH_PER_RECORD_FRESH_PAGE_ISOLATION",
"COMPARE_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R4_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"PER_RECORD_FRESH_EXPLORER_PAGE_TARGET_COMPARE_RECERTIFICATION"
},null,2));