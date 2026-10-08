#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r2_r3_r1_r1.py"),"utf8");
const q=[
"SINGLE_RECORD_NON_EXPORT_SURFACE_TIMING_DIAGNOSIS","112 W Alondra Blvd","181,831","422,277",
"tenSecondObservationWindowUsed","firstBuildingTimeResolved","firstAggregateTimeResolved","stableWindowEvaluated",
"Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF",
"EXTENDED_SURFACE_SETTLE_SELECTED_ENTITY_READBACK_DIAGNOSIS"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26B_R2_R3_R1_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26B_R2_R3_R1_BLOCKED_BEFORE_SELECTION_BECAUSE_BUILDING_PROJECT_SURFACE_NOT_SIMULTANEOUSLY_VISIBLE_TO_TEN_SECOND_NON_EXPORT_MATERIALIZATION_TIMING_DIAGNOSIS"
},null,2));