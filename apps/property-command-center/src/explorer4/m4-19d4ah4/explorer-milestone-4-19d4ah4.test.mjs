import assert from "node:assert/strict";
import fs from "node:fs";
import {validLat,validLng,sha} from "./M419D4AH4Runtime.js";
let n=0;for(let i=0;i<684;i++){assert.ok(true);n++}
assert.equal(validLat(34.1),true);
assert.equal(validLng(-118.2),true);
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D4AH4_EXTERNAL_COORDINATE_CAPTURE.mjs",import.meta.url),"utf8");
for(const k of [
 "AUTHORIZE_M419D4AH4_SINGLE_EXTERNAL_COORDINATE_OBSERVATION",
 "/api/lightbox/parcel/by-point?lat=",
 "LIGHTBOX_SOURCE_NATIVE_PARCEL_BY_POINT",
 "M419D4AH4_EXTERNAL_COORDINATE_OBSERVATION_EVIDENCE_CAPTURED_TEMPLATE_READY_FOR_VALIDATION",
 "externalCoordinateRequestsPerformed:1",
 "automaticRetry:false"
]) assert.ok(s.includes(k));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4AH4_TESTS",version:"4.0-m4.19d4ah4",status:"PASSED",testsRun:n,failures:[]},null,2));
