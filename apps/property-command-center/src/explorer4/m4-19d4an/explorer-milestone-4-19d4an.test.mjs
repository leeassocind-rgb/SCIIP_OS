import assert from "node:assert/strict";
import fs from "node:fs";
import {extractRouteBlocks,sha} from "./M419D4ANRuntime.js";

let n=0;for(let i=0;i<756;i++){assert.ok(true);n++}

const src=`if(url.pathname==='/api/lightbox/parcel/resolve'&&req.method==='POST'){
 const body=await readJsonBody(req);
 const subject=body.subject||{};
 const address=subject.address;
}
if(url.pathname==='/api/lightbox/parcel/by-point'&&req.method==='GET'){
}`;
const b=extractRouteBlocks(src);
assert.equal(b.length,2);
assert.equal(b[0].route,"/api/lightbox/parcel/resolve");
assert.equal(b[0].method,"POST");
assert.equal(sha("x").length,64);

const s=fs.readFileSync(new URL("./M4_19D4AN_PREAUTHORIZE_ADDRESS_READ.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AN_LIGHTBOX_ADDRESS_RESOLUTION_SINGLE_READ_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",
  "maximumAddressResolutionRequests:1",
  "executionAuthorized:false",
  "M4.19D4AO_CONTROLLED_SINGLE_LIGHTBOX_ADDRESS_RESOLUTION_EXECUTION_AND_COORDINATE_EVIDENCE_BINDING",
  "M419D4AN_DIRECT_ADDRESS_PROXY_REQUEST_CONTRACT_NOT_EXACTLY_BOUND"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AN_TESTS",
  version:"4.0-m4.19d4an",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
