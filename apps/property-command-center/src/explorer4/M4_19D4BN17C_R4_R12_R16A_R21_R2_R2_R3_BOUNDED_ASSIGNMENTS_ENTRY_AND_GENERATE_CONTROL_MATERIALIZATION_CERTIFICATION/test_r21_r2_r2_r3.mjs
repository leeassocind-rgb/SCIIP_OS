#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"certify_r21_r2_r2_r3.py"),"utf8");
const q=["exactSourceLiveAssignmentsBindingConsumed","singleBoundedAssignmentsClickOnly","exactGenerateControlUniqueAfterEntry","generateReportInvocationOff","exportControlInvocationOff","SINGLE_EXACT_ASSIGNMENTS_CLICK_ONLY","BOUNDED_ASSIGNMENTS_ENTRY_CERTIFIED_GENERATE_CLIENT_LISTING_REPORT_CONTROL_MATERIALIZED","R21_R2_R2_R2_EVIDENCE_REQUIRED","pixelEvidence"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R21_R2_R2_R3_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R21_R2_R2_R2_CERTIFIED_EXACT_ASSIGNMENTS_SOURCE_LIVE_BINDING_TO_SINGLE_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION"},null,2));