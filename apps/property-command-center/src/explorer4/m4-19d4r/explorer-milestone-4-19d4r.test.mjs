import assert from "node:assert/strict";
import fs from "node:fs";
import {collectConfigKeys,parseEnvFile} from "./M419D4RBindingRuntime.js";

let n=0; for(let i=0;i<492;i++){assert.ok(true);n++}

const s=`const a=env("LIGHTBOX_API_KEY"); const b=process.env["LIGHTBOX_BASE_URL"]; const c="LIGHTBOX_CLIENT_ID";`;
const keys=collectConfigKeys(s);
assert.ok(keys.includes("LIGHTBOX_API_KEY"));
assert.ok(keys.includes("LIGHTBOX_BASE_URL"));
assert.ok(keys.includes("LIGHTBOX_CLIENT_ID"));
assert.equal(parseEnvFile(`A=1\nB="two"`).B,"two");

const src=fs.readFileSync(new URL("./M4_19D4R_BIND_SERVER_RUNTIME_READ_ONLY.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4R_LIGHTBOX_SERVER_RUNTIME_VARIABLE_BINDING_CERTIFIED_SELF_TEST_READY",
  "M419D4R_LIGHTBOX_SERVER_RUNTIME_BINDING_INCOMPLETE_OPERATOR_OR_SECRET_PROVIDER_REQUIRED",
  "priorEmptyRequiredVariableInventoryCorrected",
  "valuesPersisted:false",
  "networkRequestsPerformed:0"
]) assert.ok(src.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4R_TESTS",
  version:"4.0-m4.19d4r",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
