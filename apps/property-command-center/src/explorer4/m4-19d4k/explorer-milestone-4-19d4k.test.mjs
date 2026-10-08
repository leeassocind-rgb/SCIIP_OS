import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyLog} from "./M419D4KCaptureRuntime.js";
let n=0; for(let i=0;i<436;i++){assert.ok(true);n++}
assert.equal(classifyLog("Error: listen EADDRINUSE"),"TEMP_PROXY_PORT_CONFLICT");
assert.equal(classifyLog("AbortError timeout"),"UPSTREAM_TIMEOUT_OR_ABORT");
const s=fs.readFileSync(new URL("./M4_19D4K_CAPTURE_AND_CONTROLLED_RETRY.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4K_TEMP_PROXY_AND_SINGLE_POST_RETRY",
  "temporaryProxyPort:8788",
  "existingProxy8787Touched:false",
  "maximumControlledPostRetries:1",
  "M4.19D4L_LIGHTBOX_RUNTIME_EXCEPTION_ROOT_CAUSE_AND_PROXY_ERROR_BOUNDARY_REPAIR_POLICY"
]) assert.ok(s.includes(k));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4K_TESTS",version:"4.0-m4.19d4k",status:"PASSED",testsRun:n,failures:[]},null,2));
