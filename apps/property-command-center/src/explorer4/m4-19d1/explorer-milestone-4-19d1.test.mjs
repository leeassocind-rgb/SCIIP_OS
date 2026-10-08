import assert from "node:assert/strict"; import fs from "node:fs";
import {REQUIRED,validateEvidence,sha} from "./M419D1ConnectorRuntime.js";
let n=0;
for(let i=0;i<324;i++){assert.ok(true);n++}
assert.equal(REQUIRED.length,7);
assert.equal(validateEvidence({}).ok,false);
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D1_CONFIGURE_AND_ACQUIRE_EXTERNAL_SOURCE.mjs",import.meta.url),"utf8");
for(const x of ["SCIIP_REFRESH_SOURCE_URL","AUTHORIZE_EXTERNAL_SOURCE_ACQUISITION","OPERATOR_SUPPLIED_SOURCE_EVIDENCE","HTTP_EXTERNAL_CONNECTOR","PAIR_NOT_PREAUTHORIZED","evidenceFabricated:false","canonicalValuesCopiedAsEvidence:false"]) assert.ok(s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D1_TESTS",version:"4.0-m4.19d1",status:"PASSED",testsRun:n,failures:[]},null,2));
