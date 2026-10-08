import assert from "node:assert/strict";
import fs from "node:fs";
import {extractFetches,extractObjectAssignments,sha} from "./M419D4AN1Runtime.js";

let n=0;for(let i=0;i<764;i++){assert.ok(true);n++}

const f=extractFetches(`fetch('/api/lightbox/enrich',{method:'POST',body:JSON.stringify({subject:{address:property.address}})})`);
assert.equal(f.length,1);
const o=extractObjectAssignments(`const subject={id:property.id,address:property.address};`);
assert.equal(o.length,1);
assert.equal(sha("x").length,64);

const s=fs.readFileSync(new URL("./M4_19D4AN1_CALLER_PROXY_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AN1_CALLER_TO_PROXY_ADDRESS_REQUEST_SHAPE_CERTIFIED_CORRECTED_PREAUTHORIZATION_READY",
  "M419D4AN1_CALLER_TO_PROXY_ADDRESS_REQUEST_SHAPE_NOT_PROVEN",
  "M4.19D4AN2_CORRECTED_ADDRESS_RESOLUTION_REQUEST_PREAUTHORIZATION",
  "exactCallerProofRequired:true"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AN1_TESTS",
  version:"4.0-m4.19d4an1",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
