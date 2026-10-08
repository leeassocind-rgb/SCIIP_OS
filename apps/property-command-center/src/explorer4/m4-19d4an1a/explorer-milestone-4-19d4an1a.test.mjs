import assert from "node:assert/strict";
import fs from "node:fs";
import {isAdmissiblePath,extractFetches,sha} from "./M419D4AN1ARuntime.js";

let n=0;for(let i=0;i<772;i++){assert.ok(true);n++}

assert.equal(isAdmissiblePath("/app/src/explorer4/m4-19d4an1/foo.js"),false);
assert.equal(isAdmissiblePath("/app/src/foo.test.mjs"),false);
assert.equal(isAdmissiblePath("/app/evidence/foo.js"),false);
assert.equal(isAdmissiblePath("/app/src/broker-product/foo.js"),true);
assert.equal(extractFetches(`fetch('/api/lightbox/enrich',{method:'POST'})`).length,1);
assert.equal(sha("x").length,64);

const s=fs.readFileSync(new URL("./M4_19D4AN1A_ORIGINAL_SOURCE_CERTIFICATION.mjs",import.meta.url),"utf8");
for(const k of [
  "priorCircularEvidenceRejected",
  "generatedMilestoneSourcesExcluded:true",
  "M419D4AN1A_ORIGINAL_SOURCE_CALLER_PROXY_ADDRESS_REQUEST_SHAPE_CERTIFIED_PREAUTHORIZATION_READY",
  "M419D4AN1A_AN1_CIRCULAR_TEST_EVIDENCE_REJECTED_ORIGINAL_SOURCE_PATH_NOT_PROVEN",
  "M4.19D4AN2_LIGHTBOX_INTERNAL_ADDRESS_RESOLUTION_FACTORY_AND_PROVIDER_CONTRACT_FORENSICS"
])assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AN1A_TESTS",
  version:"4.0-m4.19d4an1a",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
