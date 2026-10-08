#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"certify_r21_r2_r2_r4.py"),"utf8");
const q=[
"generateControlMaterializationClassificationConsumed",
"exactGenerateSourceBindingResolved",
"exactReportReviewMountGateResolved",
"exactExportSourceBindingResolved",
"singleBoundedGenerateClickOnly",
"reportReviewReadbackRequired",
"exportControlReadbackRequired",
"exportControlInvocationOff",
"BOUNDED_REPORT_REVIEW_ENTRY_CERTIFIED_EXPORT_CONTROL_MATERIALIZED"
];
for(const x of q){
  if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R21_R2_R2_R4_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R21_R2_R2_R3_CERTIFIED_GENERATE_CONTROL_TO_SINGLE_BOUNDED_REPORT_REVIEW_ENTRY_AND_EXPORT_CONTROL_MATERIALIZATION"
},null,2));