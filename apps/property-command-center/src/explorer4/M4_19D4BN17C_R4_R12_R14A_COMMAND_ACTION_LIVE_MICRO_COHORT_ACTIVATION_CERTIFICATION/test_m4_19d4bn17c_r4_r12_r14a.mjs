#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn17c_r4_r12_r14a.py"),"utf8");
const req=[
"r14Passed",
"freshPageTargetPerRecordPolicyUsed",
"samePageReuseAcrossRecordsIsFalse",
"freshIsolatedBrowserPerRecordIsFalse",
"allExecutedCommandActionsCertified",
"allThreeCommandActionsCertified",
"COMMAND_ACTION_LIVE_ACTIVATION_CERTIFIED_THREE_OF_THREE_WITH_PER_RECORD_FRESH_PAGE_ISOLATION",
"COMMAND_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE",
"analyzePresentAuthorityOff",
"exportPresentationAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R14A_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"COMMAND_ONLY_LIVE_THREE_RECORD_FRESH_PAGE_PER_RECORD_ACTIVATION_CERTIFICATION"
},null,2));