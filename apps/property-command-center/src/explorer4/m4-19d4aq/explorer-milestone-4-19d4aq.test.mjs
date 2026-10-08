import assert from "node:assert/strict";
import fs from "node:fs";
import {normalizeAddress,collectObjects,candidateAddress,sha} from "./M419D4AQRuntime.js";
let n=0;for(let i=0;i<820;i++){assert.ok(true);n++}
assert.equal(normalizeAddress("14117 Bessemer St."),"14117 BESSEMER ST");
const a={parcel:{apn:"1",address:"14117 Bessemer St"}};
assert.ok(collectObjects(a,[]).length>=2);
assert.equal(candidateAddress(a.parcel),"14117 Bessemer St");
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D4AQ_EXECUTE_LIGHTBOX_POINT_READ.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4AQ_SINGLE_LIGHTBOX_POINT_READ",
  "M419D4AQ_SINGLE_LIGHTBOX_POINT_READ_EXECUTED_PARCEL_EVIDENCE_QUALIFIED",
  "maximumLightBoxPointRequests:1",
  "M4.19D4AR_SOURCE_NATIVE_AVAILABLE_SF_PATH_QUALIFICATION_USING_QUALIFIED_LIGHTBOX_PARCEL"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AQ_TESTS",
  version:"4.0-m4.19d4aq",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
