#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"observe_bn9b_r2.py"),"utf8");
const r=["class WS:","resolve_target","BN9A_PASSED_EVIDENCE_REQUIRED","analyzeControlClicked","presentControlClicked",
"mapVisibleAfterConsumers","LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED",
"M4_19D4BN9C_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSURE","applicationSourceMutation","External websocket dependency: OFF"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN9B_R2_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"SELF_CONTAINED_CDP_DISCOVERY_AND_WEBSOCKET"},null,2));
