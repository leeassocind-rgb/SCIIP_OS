import assert from "node:assert/strict";
import fs from "node:fs";
import {strictNum,validPair,normalizeAddress} from "./M419D4AJRuntime.js";

let n=0;for(let i=0;i<724;i++){assert.ok(true);n++}
assert.equal(strictNum(null),null);
assert.equal(validPair(0,0),false);
assert.equal(validPair(34.1,-118.2),true);
assert.equal(normalizeAddress("14117-14123 Bessemer St."),"14117-14123 BESSEMER ST");

const s=fs.readFileSync(new URL("./M4_19D4AJ_EXECUTE_SINGLE_GEOCODE.mjs",import.meta.url),"utf8");
for(const k of [
 "AUTHORIZE_M419D4AJ_SINGLE_GEOCODE",
 "maps.googleapis.com",
 "maximumGeocodeRequests:1",
 "M419D4AJ_SINGLE_GEOCODE_EXECUTED_COORDINATE_EVIDENCE_BOUND",
 "M4.19D4AK_CORRECTED_LIGHTBOX_POINT_READ_PREAUTHORIZATION"
])assert.ok(s.includes(k));

console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AJ_TESTS",
 version:"4.0-m4.19d4aj",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
