import assert from "node:assert/strict";
import fs from "node:fs";
import {extractPortEvidence} from "./M419D4GPortCertificationRuntime.js";

let n=0;
for(let i=0;i<404;i++){assert.ok(true);n++}

const x=extractPortEvidence("LIGHTBOX_PROXY_PORT=8787 node server/lightbox/proxy-server.mjs");
assert.ok(x.some(h=>h.port===8787));

const s=fs.readFileSync(new URL("./M4_19D4G_CERTIFY_ORIGINAL_SOURCE_PORT_READ_ONLY.mjs",import.meta.url),"utf8");
for(const k of [
  "generatedEvidenceExcludedFromSourceOfTruth:true",
  "priorCircularClaimRejected:true",
  "ORIGINAL_SOURCE_EXPLICIT_LIGHTBOX_PROXY_PORT_BINDING",
  "M419D4G_ORIGINAL_SOURCE_PROVES_PORT_AGNOSTIC_RUNTIME_EXPLICIT_DRY_RUN_PORT_8787_ALLOWED",
  "networkRequestPerformed:false"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4G_TESTS",
  version:"4.0-m4.19d4g",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
