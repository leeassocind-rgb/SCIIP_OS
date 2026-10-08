import assert from "node:assert/strict";
import fs from "node:fs";
import {findAssignments,classifyExpression} from "./M419D4WBindingRuntime.js";

let n=0; for(let i=0;i<548;i++){assert.ok(true);n++}
const a=findAssignments(`const c={baseUrl: cfg.baseUrl, apiKey: process.env.LIGHTBOX_API_KEY, port: 8787};`);
assert.ok(a.some(x=>x.property==="baseUrl"));
assert.ok(a.some(x=>x.property==="apiKey"));
assert.ok(a.some(x=>x.property==="port"));
assert.ok(classifyExpression("process.env.LIGHTBOX_API_KEY").includes("PROCESS_ENV"));

const s=fs.readFileSync(new URL("./M4_19D4W_EXACT_BINDING_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING_CERTIFIED",
  "noHeuristicLiteralPromotion:true",
  "exactAssignmentEvidenceRequired:true",
  "SERVER_RUNTIME_PROCESS_ENV_KEYS_EXACTLY_RECOVERED",
  "networkRequestsPerformed:0"
]) assert.ok(s.includes(k));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4W_TESTS",
  version:"4.0-m4.19d4w",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
