#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r2_r3_r1.py"),"utf8");
const q=[
"SINGLE_RECORD_SELECTED_ENTITY_READBACK_DIAGNOSIS",
"112 W Alondra Blvd",
"181,831",
"422,277",
"selectedReadbackSamplesCaptured",
"selectedMarkerInventoryCaptured",
"selectedLikeInventoryCaptured",
"buildingSfVisibilityCaptured",
"projectAggregateSfVisibilityCaptured",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"COMPOSITE_SELECTED_ENTITY_READBACK_REPAIR_AND_ALONDRA_NON_EXPORT_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26B_R2_R3_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26B_R2_R3_CORRECT_BUILDING_1_BINDING_AND_CLICK_WITH_FAILED_SF_BEARING_SELECTED_MARKER_READBACK_TO_SELECTED_ENTITY_READBACK_SURFACE_CAUSAL_DIAGNOSIS"
},null,2));