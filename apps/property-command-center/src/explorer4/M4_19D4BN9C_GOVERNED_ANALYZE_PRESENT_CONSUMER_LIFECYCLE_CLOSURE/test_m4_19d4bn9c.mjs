#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"close_bn9_lifecycle.py"),"utf8");
const r=["M419D4BN9A_EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFIED",
"M419D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED","allAnalyzeControlsClicked",
"allAnalyzeConsumersVisible","allPresentControlsClicked","allPresentConsumersVisible","allMapsVisibleAfterConsumers",
"EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN9_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY","applicationSourceMutation"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN9C_STATIC_TEST",status:"PASSED",assertions:r.length},null,2));
