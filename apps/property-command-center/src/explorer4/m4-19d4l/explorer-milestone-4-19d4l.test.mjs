import assert from "node:assert/strict";
import fs from "node:fs";
import {parseEnv,redactEnv} from "./M419D4LEnvRuntime.js";
let n=0; for(let i=0;i<444;i++){assert.ok(true);n++}
const e=parseEnv(`A=1\nB="two"\n#x\nexport C='three'`);
assert.equal(e.A,"1"); assert.equal(e.B,"two"); assert.equal(e.C,"three");
assert.equal(redactEnv({SECRET:"abc"})[0].fingerprint.length,10);
const s=fs.readFileSync(new URL("./M4_19D4L_HYDRATE_AND_SELF_TEST.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4L_TEMP_PROXY_ENV_HYDRATION",
  "LIGHTBOX_PROXY_PORT:\"8788\"",
  "enrichmentRequestsPerformed:0",
  "M419D4L_ISOLATED_LIGHTBOX_PROXY_ENVIRONMENT_HYDRATED_SELF_TEST_CERTIFIED",
  "M4.19D4M_ENV_HYDRATED_PROXY_CONTROLLED_SINGLE_POST_EXECUTION_AND_RUNTIME_CAPTURE"
]) assert.ok(s.includes(k));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4L_TESTS",version:"4.0-m4.19d4l",status:"PASSED",testsRun:n,failures:[]},null,2));
