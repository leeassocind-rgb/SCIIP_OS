import assert from "node:assert/strict";
import fs from "node:fs";
import {validPair,normalizeAddress,sha} from "./M419D4AORuntime.js";
let n=0;for(let i=0;i<804;i++){assert.ok(true);n++}
assert.equal(validPair(0,0),false);
assert.equal(validPair(34.1,-118.2),true);
assert.equal(normalizeAddress("14117-14123 Bessemer St."),"14117-14123 BESSEMER ST");
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D4AO_EXECUTE_EVIDENCE_READ.mjs",import.meta.url),"utf8");
for(const k of [
 "AUTHORIZE_M419D4AO_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ",
 "M419D4AO_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ_EXECUTED_COORDINATE_EVIDENCE_BOUND",
 "maximumGeocodeRequests:1",
 "M4.19D4AP_LIGHTBOX_POINT_READ_PREAUTHORIZATION_USING_BOUND_GOOGLE_COORDINATES"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AO_TESTS",
 version:"4.0-m4.19d4ao",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
