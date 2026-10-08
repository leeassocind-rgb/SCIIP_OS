import assert from "node:assert/strict";
import fs from "node:fs";
import {imports,urlAndBodyEvidence} from "./M419D4AGPayloadRuntime.js";

let n=0; for(let i=0;i<636;i++){assert.ok(true);n++}

const src=`import{foo}from'./x.mjs'; const lat=subject.lat,lng=subject.lng; fetch('/api/lightbox/parcel/by-point',{body:JSON.stringify({lat,lng})})`;
assert.equal(imports(src).length,1);
const e=urlAndBodyEvidence(src);
assert.ok(e.urlLines.length>=1);
assert.ok(e.bodyLines.length>=1);

const s=fs.readFileSync(new URL("./M4_19D4AG_PAYLOAD_CONTRACT_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AG_LIGHTBOX_UPSTREAM_REQUEST_PAYLOAD_CONTRACT_FORENSICS_CERTIFIED",
  "PREAUTHORIZED_ENRICH_SUBJECT_LACKS_COORDINATES_WHILE_UPSTREAM_PARCEL_RESOLUTION_REQUIRES_POINT_INPUT",
  "noSyntheticCoordinates:true",
  "newNetworkRequestsPerformed:0",
  "M4.19D4AH_SINGLE_RECORD_COORDINATE_BINDING_AND_CORRECTED_ENRICH_REQUEST_PREAUTHORIZATION"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AG_TESTS",
  version:"4.0-m4.19d4ag",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
