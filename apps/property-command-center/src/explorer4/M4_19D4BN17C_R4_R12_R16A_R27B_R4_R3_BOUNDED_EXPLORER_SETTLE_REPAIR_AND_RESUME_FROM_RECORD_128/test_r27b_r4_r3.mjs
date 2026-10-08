#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"resume_r27b_r4_r3.py"),"utf8");
const q=[
"R4R2=",
"firstUniqueExplorerSeconds",
"stableLastFiveSamples",
"len(certified_prior)!=27",
"list(range(101,128))",
"residual_canonical=canonical[27:]",
"enumerate(residual_canonical,128)",
"state!=\"complete\" or buttons==0",
"sec=2.0",
"samples=3",
"twoSecondExplorerBoundPreserved",
"pageReadyAnchoredExplorerSamplingUsed",
"residualSeventyThreeRequired",
"Download Client Listing Report",
"exportReportHandlerCertifiedBySourceContract",
"Export invocation: OFF",
"R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R4_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27B_R4_R2_PROVED_EXPLORER_MATERIALIZES_STABLY_AT_0_35S_TO_PAGE_READY_ANCHORED_THREE_SAMPLE_TWO_SECOND_SETTLE_AND_RESUME_EXACT_RESIDUAL73_WITHOUT_REPLAYING_CERTIFIED101_127"
},null,2));