#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r2.py"),"utf8");
const q=["SINGLE_RECORD_NON_EXPORT_IDENTITY_BINDING_DIAGNOSIS","112 W Alondra Blvd","boundaryNormalizedBindingEverObserved",
"uniqueContainsBindingEverObserved","firstBoundaryNormalizedBindingSeconds","alondraButtonTextsObserved",
"Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF",
"R26B_R3_ALONDRA_BOUNDED_BINDING_RECERTIFICATION_AND_FIFTY_RECORD_NON_EXPORT_RESUME"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26B_R2_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26B_R1_RECORD_31_PRE_SELECTION_TARGET_BINDING_FAILURE_TO_FIVE_SECOND_READ_ONLY_ALONDRA_CANONICAL_IDENTITY_AND_BINDING_SURFACE_DEEP_DIAGNOSIS"},null,2));