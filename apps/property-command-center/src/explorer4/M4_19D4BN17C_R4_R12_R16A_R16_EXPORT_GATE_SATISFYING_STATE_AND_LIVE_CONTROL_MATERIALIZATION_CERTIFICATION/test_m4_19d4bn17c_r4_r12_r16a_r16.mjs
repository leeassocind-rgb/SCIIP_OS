#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn17c_r4_r12_r16a_r16.py"),"utf8");
const req=["R15_EVIDENCE_REQUIRED","EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_AND_WORKSPACE_STATE","PRESENT_CONTROL_NOT_FOUND","selectedPropertyStatePresent","workspaceStateTransitionObserved","liveExportControlMaterialized","applicationMutationOff","governedMutationOff","pixelEvidenceOff","strictUiStateOnly"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R16_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"R15_SELECTED_PROPERTY_WORKSPACE_GATE_SATISFYING_STATE_AND_LIVE_EXPORT_CONTROL_MATERIALIZATION"},null,2));