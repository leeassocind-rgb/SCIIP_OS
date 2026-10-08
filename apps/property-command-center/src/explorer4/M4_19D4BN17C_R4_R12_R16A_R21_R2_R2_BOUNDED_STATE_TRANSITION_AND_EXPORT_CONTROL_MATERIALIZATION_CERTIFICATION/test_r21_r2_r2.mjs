#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"certify_r21_r2_r2.py"),"utf8");
const q=[
"r21R2R1Passed",
"exactSourceStateContractResolved",
"exactGenerateControlSourceContractResolved",
"exactReportReviewMountContractResolved",
"exactExportControlSourceContractResolved",
"boundedStateTransitionOnly",
"exportControlInvocationOff",
"BOUNDED_SHOW_REPORT_REVIEW_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFIED",
"SHOW_REPORT_REVIEW_STATE_TRANSITION_EXECUTED_EXPORT_CONTROL_MATERIALIZATION_INCOMPLETE"
];
for(const x of q){
  if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R21_R2_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R21_R2_R1_EXACT_SHOW_REPORT_REVIEW_SOURCE_CONTRACT_TO_SINGLE_BOUNDED_GENERATE_REPORT_CLICK_AND_EXPORT_CONTROL_MATERIALIZATION"
},null,2));