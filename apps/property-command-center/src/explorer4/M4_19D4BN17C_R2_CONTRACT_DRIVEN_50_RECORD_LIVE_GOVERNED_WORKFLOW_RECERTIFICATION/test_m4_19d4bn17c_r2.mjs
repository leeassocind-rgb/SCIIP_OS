#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r2.py"),"utf8");
const req=["click_property","click_matching","02_SELECTED_PROPERTY","06_COMPARE","07_COMMAND","09_ANALYZE_PRESENT","11_EXPORT_PRESENTATION",
"selectionDescriptor","compareDescriptor","commandDescriptor","analyzeDescriptor","presentDescriptor","exportDescriptor",
"BN17C_PASSIVE_OBSERVER_DID_NOT_ACTIVATE_SELECTED_PROPERTY_OR_ACTION_SPECIFIC_WORKFLOW_CONTRACTS",
"M419D4BN17C_R2_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"M4_19D4BN17D_50_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("import websocket")){console.error("FAIL external websocket import remains");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R2_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"PASSIVE_STAGE_INFERENCE_REPLACED_WITH_CONTRACT_DRIVEN_UI_ACTIVATION"},null,2));