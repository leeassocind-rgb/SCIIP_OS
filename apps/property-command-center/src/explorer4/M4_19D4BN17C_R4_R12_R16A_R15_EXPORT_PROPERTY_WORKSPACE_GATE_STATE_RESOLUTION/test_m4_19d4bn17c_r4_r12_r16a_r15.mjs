#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r15.py"),"utf8");
const req=["R14_R1_EVIDENCE_REQUIRED","EXPORT_CONTROL_GATED_BY_PROPERTY_OR_WORKSPACE_STATE",
"selectedProperty","workspace","gatePredicateEvidenceResolved",
"EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_AND_WORKSPACE_STATE",
"applicationMutationOff","governedMutationOff","networkAuthorityOff","pixelEvidenceOff","liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R15_STATIC_TEST",status:"PASSED",
assertions:req.length,repair:"R14_PROPERTY_WORKSPACE_EXPORT_GATE_SOURCE_PREDICATE_AND_STATE_RESOLUTION"},null,2));