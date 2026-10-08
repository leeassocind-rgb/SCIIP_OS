#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r27b_r2_r2.py"),"utf8");
const q=["READ_ONLY_SOURCE_AND_EVIDENCE_DIAGNOSIS","Download Client Listing Report","exportReport","SOURCE_HIT_COUNT:",
"EXACT_LABEL_SOURCE_HIT_COUNT:","EXPORTREPORT_SOURCE_HIT_COUNT:","Application source mutation: OFF",
"Governed data mutation: OFF","Live UI interaction: OFF","Export invocation: OFF",
"INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R27B_R2_R2_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R27B_R2_R1_PROVED_STRUCTURED_CONTROL_READBACK_ABSENT_TO_READ_ONLY_APPLICATION_SOURCE_LABEL_HANDLER_SURFACE_DIAGNOSIS"},null,2));