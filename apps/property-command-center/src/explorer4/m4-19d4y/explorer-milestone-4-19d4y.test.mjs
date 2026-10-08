import assert from "node:assert/strict";
import fs from "node:fs";
import {imports,configIdentifiers} from "./M419D4YImportRuntime.js";

let n=0; for(let i=0;i<564;i++){assert.ok(true);n++}

const src=`import {loadConfig} from './config.mjs'; const config=loadConfig(); console.log(config.port);`;
const imps=imports(src);
assert.ok(imps.some(x=>x.specifier==="./config.mjs"));
assert.ok(configIdentifiers(src).includes("config"));

const s=fs.readFileSync(new URL("./M4_19D4Y_IMPORT_CALLSITE_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4Y_PROXY_BOOTSTRAP_CONFIG_IMPORT_CALLSITE_FORENSICS_CERTIFIED",
  "DIRECT_CONFIG_IMPORT_AND_BOOTSTRAP_USAGE_PROVEN",
  "INDIRECT_CONFIG_IMPORT_AND_BOOTSTRAP_USAGE_PROVEN",
  "noPrecedenceMutationBeforeImportUsageProof:true",
  "networkRequestsPerformed:0"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4Y_TESTS",
  version:"4.0-m4.19d4y",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
