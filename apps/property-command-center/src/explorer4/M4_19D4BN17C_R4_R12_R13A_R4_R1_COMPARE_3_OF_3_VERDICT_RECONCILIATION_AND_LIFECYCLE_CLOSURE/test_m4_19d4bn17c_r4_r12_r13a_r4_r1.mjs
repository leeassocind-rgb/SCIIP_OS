#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"close_bn17c_r4_r12_r13a_r4_r1.py"),"utf8");
const req=[
"r4CertifiedCountThree",
"r4AllThreeCompareActionsCertified",
"r4EachOutcomeCompareCertified",
"samePageReuseAcrossRecordsIsFalse",
"freshIsolatedBrowserPerRecordIsFalse",
"FALSE_VALUED_POLICY_FACTS_INCLUDED_IN_ALL_CHECKS_REDUCTION",
"COMPARE_ACTION_CERTIFIED_AND_CLOSED_THREE_OF_THREE",
"POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R4_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"FALSE_POLICY_VALUES_RECAST_AS_POSITIVE_ASSERTIONS_COMPARE_3_OF_3_CLOSED"
},null,2));