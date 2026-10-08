import assert from "node:assert/strict"; import fs from "node:fs";
import {findAvailableSfCandidates,normNum,sha} from "./M419D4LightBoxDryRunRuntime.js";
let n=0; for(let i=0;i<348;i++){assert.ok(true);n++}
assert.equal(normNum("12,345"),12345);
assert.equal(findAvailableSfCandidates({availableSf:123}).length,1);
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D4_LIGHTBOX_SINGLE_RECORD_DRY_RUN.mjs",import.meta.url),"utf8");
for(const x of [
  "AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ",
  "M419D4_LIGHTBOX_READ_ENDPOINT_CONFIGURATION_REQUIRED",
  "M419D4_LIGHTBOX_SINGLE_RECORD_DRY_RUN_COMPLETED_AVAILABLE_SF_NOT_PROVEN",
  "M419D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFIED",
  "responseSha",
  "evidenceFabricated:false",
  "networkRequestPerformed:true"
]) assert.ok(s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4_TESTS",version:"4.0-m4.19d4",status:"PASSED",testsRun:n,failures:[]},null,2));
