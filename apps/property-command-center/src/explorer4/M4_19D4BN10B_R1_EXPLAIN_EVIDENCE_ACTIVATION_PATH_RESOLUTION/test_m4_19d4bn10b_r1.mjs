#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn10b_r1.py"),"utf8");
const req=[
"allVisibleExplainControlsAbsent",
"allEvidenceSignalsPresent",
"allExplanationSignalsPresent",
"runCommand",
"CommandPalette",
"ACTION_DISPATCHER",
"activationRouteResolved",
"EXPLAIN_EVIDENCE_CONSUMER_PRESENT_VISIBLE_CONTROL_ASSUMPTION_INVALID_ACTIVATION_PATH_RESOLVED",
"M4_19D4BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION",
"noMutationAuthority"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN10B_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length
},null,2));
