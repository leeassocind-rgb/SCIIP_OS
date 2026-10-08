#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"recertify_bn10b_r2.py"),"utf8");
const req=[
"ACTION_DISPATCHER","BN10B_R1_EVIDENCE_REQUIRED","commandSurfaceOpened","explainActionClicked",
"explainActionDescriptor","explainConsumerVisible","evidenceSignalCount","explanationSignalCount",
"LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTIVATION_PATH_CERTIFIED",
"M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE",
"applicationSourceMutation","class WS:"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN10B_R2_STATIC_TEST",
 status:"PASSED",
 assertions:req.length
},null,2));
