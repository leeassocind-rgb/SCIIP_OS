#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r28b_r2.py"),"utf8");
const q=[
"SINGLE_RECORD_NON_EXPORT_EXPLORER_ENTRY_CONTROL_DIAGNOSIS",
"12400 Philadelphia St",
"visibleEnabledExplorerCount",
"explorerOuterHtmlCaptured",
"singleExplorerClickMaximumObserved",
"postClickSurfaceReadbackCaptured",
"POST_CLICK_MARKER_MAXIMUM",
"EXPLORER_CLICK_SUCCEEDED_AND_EXPLORER_SURFACE_MATERIALIZED_PRIOR_R28B_ENTRY_FAILURE_TRANSIENT_OR_CERTIFICATION_LOGIC_MISMATCH",
"R28B_R3_RECORD_201_EXPLORER_ENTRY_RECERTIFICATION_AND_RESUME",
"EXPLORER_CLICK_DISPATCHED_BUT_EXPLORER_SURFACE_DID_NOT_MATERIALIZE",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_R1_CERTIFIED_RECORD201_EXPLORER_SETTLED_BUT_ENTRY_CLICK_FAILED_TO_SINGLE_RECORD_EXACT_CONTROL_STATE_CLICK_DISPATCH_AND_POST_CLICK_SURFACE_DEEP_DIAGNOSIS"
},null,2));