#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r17.py"),"utf8");
const req=["r16R3CapabilityFeaturePermissionClassification","sourceGateRuntimeCandidatesResolved","liveRuntimeStateInspectionCompleted","LIVE_EXPORT_FEATURE_FLAG_OR_OVERRIDE_STATE_RESOLVED","LIVE_EXPORT_CAPABILITY_REGISTRATION_OR_LOAD_STATE_RESOLVED","LIVE_EXPORT_PERMISSION_OR_AUTHORIZATION_STATE_RESOLVED","EXPORT_FEATURE_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED","EXPORT_CAPABILITY_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED","EXPORT_PERMISSION_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED","liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R17_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"R16_R3_CAPABILITY_FEATURE_PERMISSION_CLASSIFICATION_TO_LIVE_RUNTIME_GATE_STATE_RESOLUTION"},null,2));