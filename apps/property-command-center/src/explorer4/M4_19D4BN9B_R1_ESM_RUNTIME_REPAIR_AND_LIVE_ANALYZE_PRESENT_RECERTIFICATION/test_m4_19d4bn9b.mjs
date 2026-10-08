#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"observe_bn9b.mjs"),"utf8");

const req=[
  ["native ESM fs import",t.includes('import fs from "node:fs"')],
  ["native ESM path import",t.includes('import path from "node:path"')],
  ["no CommonJS require",!t.includes("require(")],
  ["WebSocket CDP",t.includes("new WebSocket")],
  ["Analyze activation",t.includes("analyzeControlClicked")],
  ["Present activation",t.includes("presentControlClicked")],
  ["Map continuity",t.includes("mapVisibleAfterConsumers")],
  ["exact-ten success",t.includes("LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED")],
  ["BN9C transition",t.includes("M4_19D4BN9C_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSURE")],
  ["mutation authority off",t.includes("applicationSourceMutation:false")]
];

for(const [label,ok] of req){
  if(!ok){
    console.error("FAIL",label);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN9B_R1_STATIC_TEST",
  status:"PASSED",
  assertions:req.length,
  repair:"COMMONJS_REQUIRE_REMOVED_STATIC_TEST_AND_OBSERVER_NATIVE_ESM"
},null,2));
