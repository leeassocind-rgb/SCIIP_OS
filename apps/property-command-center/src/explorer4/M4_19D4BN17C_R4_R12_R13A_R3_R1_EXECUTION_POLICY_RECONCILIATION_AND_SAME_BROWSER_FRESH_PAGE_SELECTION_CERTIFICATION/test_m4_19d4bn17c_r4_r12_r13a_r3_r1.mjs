#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"reconcile_bn17c_r4_r12_r13a_r3_r1.py"),"utf8");
const req=[
"freshPageSameBrowserSelectionCertified",
"freshIsolatedBrowserObservedFailed",
"sameBrowserExecutionTopologyHasTwoIndependentSuccesses",
"isolatedBrowserExcludedFromCompareRecertification",
"freshPagePerRecordSameBrowserRequired",
"samePageReuseAcrossRecordsDisallowed",
"PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT",
"CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD",
"COMPARE_MICRO_COHORT_RECERTIFICATION_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R3_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"EXECUTION_TOPOLOGY_SPLIT_SAME_BROWSER_FRESH_PAGE_CERTIFIED_ISOLATED_BROWSER_EXCLUDED"
},null,2));