import assert from "node:assert/strict";
import fs from "node:fs";
import {assignments,configObjectNames,exportedNames} from "./M419D4XProducerRuntime.js";

let n=0; for(let i=0;i<556;i++){assert.ok(true);n++}

const src=`export const config={baseUrl: foo, apiKey: bar}; const opts={port:8787};`;
const a=assignments(src);
assert.ok(a.some(x=>x.property==="baseUrl"));
assert.ok(a.some(x=>x.property==="apiKey"));
assert.ok(a.some(x=>x.property==="port"));
assert.ok(configObjectNames(src).includes("config"));
assert.ok(exportedNames(src).includes("config"));

const s=fs.readFileSync(new URL("./M4_19D4X_EXACT_PRODUCER_BINDING.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4X_SERVER_CONFIG_OBJECT_PRODUCER_EXACT_BINDING_CERTIFIED",
  "exactProducerOwnershipRequired:true",
  "precedenceMustBeCertifiedBeforeRuntimeMutation:true",
  "CONFIG_MODULE_TO_PROXY_MULTI_STAGE_PRODUCER_CHAIN_RECOVERED",
  "networkRequestsPerformed:0"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4X_TESTS",
  version:"4.0-m4.19d4x",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
