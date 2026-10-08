#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn10b.py"),"utf8");
const r=["class WS:","resolve_target","BN10A_PASSED_EVIDENCE_REQUIRED","explainControlClicked",
"explainConsumerVisible","evidenceSignalCount","explanationSignalCount","mapVisibleAfterExplain",
"LIVE_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_OBSERVED",
"M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE",
"applicationSourceMutation","External websocket dependency: OFF"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN10B_STATIC_TEST",status:"PASSED",assertions:r.length},null,2));
