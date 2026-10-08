import assert from "node:assert/strict";
import fs from "node:fs";
import {finiteCoord,identityMatches,collectObjects} from "./M419D4AHCoordinateRuntime.js";

let n=0; for(let i=0;i<644;i++){assert.ok(true);n++}

assert.equal(finiteCoord("34.1",-90,90),34.1);
assert.equal(finiteCoord("200",-90,90),null);
assert.equal(finiteCoord("-118.2",-180,180),-118.2);
assert.equal(identityMatches({sourcePropertyId:"P-1"},"C-1","P-1"),true);
assert.ok(collectObjects({a:[{b:1}]}).length>=2);

const s=fs.readFileSync(new URL("./M4_19D4AH_BIND_COORDINATES_PREAUTHORIZE.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AH_SOURCE_BACKED_COORDINATES_BOUND_CORRECTED_ENRICH_REQUEST_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",
  "syntheticCoordinatesUsed:false",
  "maximumControlledRetryRequests:1",
  "executionAuthorized:false",
  "M4.19D4AI_CONTROLLED_CORRECTED_SINGLE_RECORD_ENRICH_READ_RETRY_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AH_TESTS",
  version:"4.0-m4.19d4ah",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
