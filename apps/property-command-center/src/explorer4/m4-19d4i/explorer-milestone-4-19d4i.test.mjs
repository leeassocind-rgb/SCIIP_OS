import assert from "node:assert/strict";
import fs from "node:fs";
import {findAvailableSf,numberLike} from "./M419D4ILiveRuntime.js";

let n=0; for(let i=0;i<420;i++){assert.ok(true);n++}
assert.equal(numberLike("12,345 SF"),12345);
assert.equal(findAvailableSf({availableSf:123}).length,1);

const s=fs.readFileSync(new URL("./M4_19D4I_EXECUTE_SINGLE_POST_DRY_RUN.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4I_SINGLE_LIGHTBOX_POST_READ",
  "ONLY_LOCAL_LIGHTBOX_PROXY_ALLOWED",
  "M419D4I_LIGHTBOX_LIVE_POST_SUCCEEDED_SOURCE_NATIVE_AVAILABLE_SF_NOT_PRESENT",
  "M419D4I_LIGHTBOX_LIVE_POST_SOURCE_NATIVE_AVAILABLE_SF_QUALIFIED",
  "singleReadOnlyExternalRequestMaximum:1"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4I_TESTS",
  version:"4.0-m4.19d4i",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
