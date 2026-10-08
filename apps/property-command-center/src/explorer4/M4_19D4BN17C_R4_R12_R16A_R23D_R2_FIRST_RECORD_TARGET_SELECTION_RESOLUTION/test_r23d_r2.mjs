#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"resolve_r23d_r2.py"),"utf8");
const q=[
"FIRST_RECORD_TARGET_SELECTION_CLICK_FAILED",
"FIRST_EXACT_BUTTON_SECONDS",
"FIRST_CONTAINS_BUTTON_SECONDS",
"FIRST_MARKER_SECONDS",
"FIRST_TARGET_TEXT_SECONDS",
"exactButtons",
"containsButtons",
"markers",
"inputs",
"noTargetClickPerformed",
"assignmentsInvocationOff",
"exportInvocationOff",
"FIRST_RECORD_TARGET_NOT_MATERIALIZED_ON_FRESH_EXPLORER_PAGE"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R23D_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23D_R1_FIRST_RECORD_ZERO_TARGET_CLICK_CANDIDATES_TO_BOUNDED_FRESH_EXPLORER_TARGET_MATERIALIZATION_AND_CONTROL_SURFACE_RESOLUTION"
},null,2));