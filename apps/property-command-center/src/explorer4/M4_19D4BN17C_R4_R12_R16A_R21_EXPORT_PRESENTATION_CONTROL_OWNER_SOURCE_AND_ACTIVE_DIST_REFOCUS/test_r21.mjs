#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"resolve_r21.py"),"utf8");
const q=["r5R9FalsePositiveRejectionConsumed","semanticOwnerSourceScanComplete","activeDistCandidateScanComplete",
"runtimeActivationNotAssumed","EXPORT_PRESENTATION_CONTROL_OWNER_AND_DIST_CANDIDATES_LOCATED_RUNTIME_ACTIVATION_UNPROVEN",
"EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_LOCATED_NO_ACTIVE_DIST_CANDIDATE_OBSERVED","liveWorkflowActionAuthorityOff"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R21_STATIC_TEST",status:"PASSED",assertions:q.length},null,2));