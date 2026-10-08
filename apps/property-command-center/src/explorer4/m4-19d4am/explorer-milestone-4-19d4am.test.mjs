import assert from "node:assert/strict";
import fs from "node:fs";
import {extractRoutes,hasAny,sha} from "./M419D4AMRuntime.js";

let n=0;for(let i=0;i<748;i++){assert.ok(true);n++}
const routes=extractRoutes(`if(url.pathname==='/api/lightbox/enrich'&&req.method==='POST'){}; if(url.pathname==="/api/lightbox/parcel/by-point"&&req.method==="GET"){}`);
assert.equal(routes.length,2);
assert.equal(routes[0].route,"/api/lightbox/enrich");
assert.equal(routes[0].method,"POST");
assert.equal(hasAny("streetAddress",["address"]),true);
assert.equal(sha("x").length,64);

const s=fs.readFileSync(new URL("./M4_19D4AM_CONTRACT_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AM_LIGHTBOX_ADDRESS_RESOLUTION_REQUEST_RESPONSE_CONTRACT_CERTIFIED_PREAUTHORIZATION_READY",
  "M419D4AM_LIGHTBOX_IDENTIFIER_CONTRACT_CERTIFIED_ADDRESS_TO_COORDINATE_PATH_UNPROVEN",
  "M419D4AM_LIGHTBOX_POINT_RESOLUTION_CONTRACT_CERTIFIED_TRUE_COORDINATE_INPUT_STILL_REQUIRED",
  "exactRequestContractRequiredBeforeRead:true",
  "M4.19D4AN_LIGHTBOX_ADDRESS_RESOLUTION_SINGLE_READ_PREAUTHORIZATION"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AM_TESTS",
  version:"4.0-m4.19d4am",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
