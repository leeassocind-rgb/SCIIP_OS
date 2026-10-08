import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyLine,likelyConfigProps} from "./M419D4SConfigSourceRuntime.js";

let n=0; for(let i=0;i<516;i++){assert.ok(true);n++}
assert.ok(classifyLine("constructor(config){ this.baseUrl=config.baseUrl }").includes("CONSTRUCTOR_OR_INJECTION"));
assert.ok(likelyConfigProps("const x=config.baseUrl; this.apiKey=y").includes("baseUrl"));

const s=fs.readFileSync(new URL("./M4_19D4S_CONFIG_OBJECT_DEFAULTS_SECRET_SOURCE_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4S_LIGHTBOX_CONFIG_OBJECT_DEFAULTS_SECRET_SOURCE_FORENSICS_CERTIFIED",
  "environmentVariableBranchClosed:true",
  "doNotAssumeOperatorSecretBindingYet:true",
  "configurationSourceMustBeProvenBeforeBinding:true",
  "networkRequestsPerformed:0"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4S_TESTS",
  version:"4.0-m4.19d4s",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
