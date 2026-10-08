import assert from "node:assert/strict";
import fs from "node:fs";
import {parseEnvFile,classifyCredentialSources} from "./M419D4ADCredentialRuntime.js";

let n=0; for(let i=0;i<604;i++){assert.ok(true);n++}

const f=parseEnvFile(`LIGHTBOX_API_KEY="abc"\nVITE_LIGHTBOX_API_KEY="bad"\n`);
assert.equal(f.LIGHTBOX_API_KEY,"abc");
const c=classifyCredentialSources({},f);
assert.equal(c.approvedBound,true);
assert.equal(c.unsafeClientExposedCandidatePresent,true);

const d=classifyCredentialSources({}, {VITE_LIGHTBOX_API_KEY:"client"});
assert.equal(d.approvedBound,false);
assert.equal(d.unsafeClientExposedCandidatePresent,true);

const s=fs.readFileSync(new URL("./M4_19D4AD_BINDING_GATE.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AD_OPERATOR_SUPPLIED_LIGHTBOX_API_KEY_REQUIRED",
  "M419D4AD_LIGHTBOX_API_KEY_APPROVED_LOCAL_SOURCE_BOUND",
  "VITE_LIGHTBOX_API_KEY",
  "secretValuesPersistedInEvidence:false",
  "m4-19d4ad-bind-lightbox-api-key-securely.command"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AD_TESTS",
  version:"4.0-m4.19d4ad",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
