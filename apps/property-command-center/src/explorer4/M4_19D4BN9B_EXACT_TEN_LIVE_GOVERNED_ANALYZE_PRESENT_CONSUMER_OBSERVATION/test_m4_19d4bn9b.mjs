#!/usr/bin/env node
const fs=require("fs"),path=require("path");const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"observe_bn9b.js"),"utf8");
const r=["WebSocket","9333","analyzeControlClicked","presentControlClicked","mapVisibleAfterConsumers","LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED","M4_19D4BN9C_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSURE","controlledValueMatch","explorerMounted","Pixel evidence: OFF"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN9B_STATIC_TEST",status:"PASSED",assertions:r.length},null,2));
