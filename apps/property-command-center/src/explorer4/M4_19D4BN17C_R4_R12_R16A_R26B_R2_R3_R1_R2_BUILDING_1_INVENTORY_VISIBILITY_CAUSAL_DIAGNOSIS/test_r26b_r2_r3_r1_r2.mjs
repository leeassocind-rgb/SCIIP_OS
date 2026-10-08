#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r2_r3_r1_r2.py"),"utf8");
const q=[
"READ_ONLY_DOM_IDENTITY_TRACE","112 W Alondra Blvd","181,831","422,277",
"addressOnlyControlPresent","addressOnlyControlDistinctFromAggregate","domAttributesCaptured",
"reactBindingHintsCaptured","parentContextCaptured","siblingContextCaptured","storageHintsCaptured",
"Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF",
"ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSIS"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26B_R2_R3_R1_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26B_R2_R3_R1_R1_PROJECT_AGGREGATE_STABLE_BUT_181831_SF_BUILDING_ABSENT_WITH_SECOND_ADDRESS_ONLY_CONTROL_TO_READ_ONLY_DOM_IDENTITY_AND_BINDING_TRACE"
},null,2));