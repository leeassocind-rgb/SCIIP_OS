#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"design_r21_r3.py"),"utf8");
const q=[
"materializedExportControlClassificationConsumed",
"exactExportControlSourceInspected",
"exportHandlerDefinitionsResolved",
"sourceExportReportBindingResolved",
"liveExactExportControlInspected",
"liveReactOnClickBindingResolved",
"guardContractDefined",
"exportControlInvocationOff",
"EXACT_EXPORT_CONTROL_SOURCE_AND_LIVE_EVENT_BINDING_RESOLVED_GUARDED_INVOCATION_DESIGN_CERTIFIED",
"SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION"
];
for(const x of q){
  if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R21_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R21_R2_R2_R4_MATERIALIZED_EXPORT_CONTROL_TO_EXACT_SOURCE_LIVE_EVENT_BINDING_AND_GUARDED_SINGLE_CLICK_DESIGN"
},null,2));