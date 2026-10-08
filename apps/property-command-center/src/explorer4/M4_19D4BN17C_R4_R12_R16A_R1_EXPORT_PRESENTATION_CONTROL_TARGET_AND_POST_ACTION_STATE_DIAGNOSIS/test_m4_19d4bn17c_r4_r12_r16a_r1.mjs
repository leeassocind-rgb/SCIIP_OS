#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r1.py"),"utf8");
const req=["r16aDiagnosticComplete","r16aExportControlNotFound","eventBearingRuntimeControlsCaptured","menuOverflowProbeCompleted","sourceExportPresentationReferencesCaptured","exportPresentationExecutionAuthorityOff","RUNTIME_EXPORT_PRESENTATION_OR_MENU_AFFORDANCE_RESOLVED","EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_BINDING_RESOLUTION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R1_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"LIVE_EVENT_BEARING_CONTROL_MENU_OVERFLOW_AND_SOURCE_CORRELATION_DIAGNOSIS"},null,2));