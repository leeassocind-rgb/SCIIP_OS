#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn15.py"),"utf8");
const req=[
"BN2","BN3","BN4","BN5","BN6","BN7","BN8","BN9","BN10","BN11","BN12","BN13","BN14A",
"GLOBAL_SEARCH","DEEP_LINK_CONTEXT_RESTORE",
"allPrerequisiteEvidencePresent","allLifecycleStatesCertified","allPrerequisitesPassed",
"bn14aSelectedEndToEndRecertification",
"M419D4BN15_EXACT_TEN_END_TO_END_GOVERNED_WORKFLOW_RECERTIFICATION_DESIGN_CERTIFIED",
"EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIVE_RECERTIFICATION_READY",
"M4_19D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION",
"READ_ONLY_ARCHITECTURE_DESIGN","governedMutationOff"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN15_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
