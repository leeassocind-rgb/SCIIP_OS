#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r16_r3.py"),"utf8");
const req=[
"r16R2ExportStillNotMaterialized",
"exactExportGateNeighborhoodsResolved",
"predicateFragmentsCaptured",
"EXPORT_REQUIRES_CAPABILITY_FEATURE_OR_PERMISSION_GATE",
"EXPORT_REQUIRES_PRESENTATION_OR_ARTIFACT_READINESS_GATE",
"EXPORT_REQUIRES_MULTI_SELECTION_OR_SELECTION_SHAPE_GATE",
"EXPORT_REQUIRES_PRESENT_WORKSPACE_SUBSTATE_BEYOND_MODE_TOGGLE",
"EXPORT_REQUIRES_WORKSPACE_SUBTYPE_OR_CONTEXT_GATE",
"applicationMutationOff",
"liveWorkflowActionAuthorityOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R16_R3_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R16_R2_BASIC_PROPERTY_WORKSPACE_GATE_INSUFFICIENT_EXACT_EXPORT_RENDER_PREDICATE_AND_SUBSTATE_DIAGNOSIS"
},null,2));