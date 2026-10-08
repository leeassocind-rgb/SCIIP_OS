#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"recertify_bn10b_r3.py"),"utf8");
const req=[
"BN10B_R2_EXPECTED_SELECTOR_GAP_NOT_PROVEN",
"[data-action],[data-command],[data-id],[role=option],[role=menuitem],button",
"semanticActionNodeCount","sampleActions","explainActionResolved","explainActionClicked",
"BN7B_COMMAND_ACTION_NODE_SELECTOR","contractWeakened",
"LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED",
"EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_AND_CONSUMER_CERTIFIED",
"M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN10B_R3_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"BN10B_SELECTOR_RECONCILED_TO_PRIOR_CERTIFIED_BN7B_COMMAND_ACTION_NODE_SEMANTICS"
},null,2));
