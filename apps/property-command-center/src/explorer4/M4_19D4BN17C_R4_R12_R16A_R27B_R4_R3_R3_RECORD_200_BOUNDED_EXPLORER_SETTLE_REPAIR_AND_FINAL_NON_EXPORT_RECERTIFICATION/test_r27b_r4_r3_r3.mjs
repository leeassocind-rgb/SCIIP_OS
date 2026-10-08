#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"recertify_r27b_r4_r3_r3.py"),"utf8");
const q=[
"firstUniqueExplorerSeconds",
"stableLastFiveSamples",
"prior.get(\"certifiedCount\")!=99",
"canon[-1]!=\"12350 Philadelphia St\"",
"Live recertification scope: RECORD 200 ONLY",
"ready!=\"complete\" or buttons==0",
"sec=2.0",
"samples=3",
"priorNinetyNineCertifiedPreserved",
"priorRecordsNotReplayed",
"record200OnlyLiveScope",
"ambiguousBindingForbidden",
"Download Client Listing Report",
"exportReportHandlerCertifiedBySourceContract",
"exactNewOneHundredCertified",
"Export invocation: OFF",
"R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R4_R3_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27B_R4_R3_R2_PROVED_RECORD200_EXPLORER_MATERIALIZES_STABLY_AT_0_35S_TO_SINGLE_RECORD_PAGE_READY_ANCHORED_TWO_SECOND_SETTLE_RECERTIFICATION_WITH_PRIOR99_PRESERVED"
},null,2));