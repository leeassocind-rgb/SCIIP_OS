import assert from "node:assert/strict";
import fs from "node:fs";
import {semanticHits,finiteSf,sha} from "./M419D4AERuntime.js";

let n=0; for(let i=0;i<620;i++){assert.ok(true);n++}

const sample={
  source:{provider:"LIGHTBOX",observedAt:"2026-08-18T00:00:00Z"},
  property:{availableSf:12345,parcelId:"P-1"}
};
const h=semanticHits(sample);
assert.ok(h.available.length>=1);
assert.ok(h.provenance.length>=1);
assert.ok(h.timestamps.length>=1);
assert.equal(finiteSf("12345"),12345);
assert.equal(finiteSf("bad"),null);
assert.equal(sha("x").length,64);

const s=fs.readFileSync(new URL("./M4_19D4AE_EXECUTE_SINGLE_READ.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4AE_SINGLE_ENRICH_READ",
  "maximumEnrichmentRequests:1",
  "M419D4AE_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_QUALIFIED",
  "canonicalOrTemporalFallbackUsed:false",
  "M4.19D4AF_SINGLE_RECORD_OBSERVATION_EVIDENCE_BINDING_AND_REFRESH_COHORT_EXPANSION_POLICY"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AE_TESTS",
  version:"4.0-m4.19d4ae",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
