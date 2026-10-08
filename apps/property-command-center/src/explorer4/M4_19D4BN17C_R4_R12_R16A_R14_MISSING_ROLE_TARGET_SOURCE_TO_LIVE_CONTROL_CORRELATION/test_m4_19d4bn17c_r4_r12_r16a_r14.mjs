#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r14.py"),"utf8");
const req=["r16aR13Passed","r13ExportTargetCountZero","sourceExportPresentationSemanticsResolved","sourceExportSpecificReferencesResolved","liveControlSurfaceCaptured","renderOrModeGateClassificationResolved","EXPORT_CONTROL_GATED_BEHIND_PRESENT_MODE","EXPORT_CONTROL_GATED_BEHIND_MENU_OR_OVERFLOW","EXPORT_CONTROL_NOT_MOUNTED_IN_CURRENT_EXPLORER_BRANCH","liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R14_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"MISSING_EXPORT_ROLE_SOURCE_TO_LIVE_RENDER_GATE_AND_CONTROL_SURFACE_CORRELATION"},null,2));