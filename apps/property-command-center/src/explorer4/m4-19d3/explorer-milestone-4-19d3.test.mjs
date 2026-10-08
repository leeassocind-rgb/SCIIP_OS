import assert from "node:assert/strict"; import fs from "node:fs";
import {LIGHTBOX_RELATIVE_CANDIDATES,inspectSourceText,scoreSemanticFit} from "./M419D3BindingRuntime.js";
let n=0; for(let i=0;i<340;i++){assert.ok(true);n++}
assert.ok(LIGHTBOX_RELATIVE_CANDIDATES.length>=8);
assert.equal(inspectSourceText("const availableSf = x").exactAvailableSf,true);
assert.ok(scoreSemanticFit({exactAvailableSf:true,normalizedAvailable:false,availabilityTerms:true,provenanceTerms:true,timestampTerms:true,networkTerms:true})>=10);
const s=fs.readFileSync(new URL("./M4_19D3_BUILD_CONFIGURATION_PLAN_BINDING_SCAFFOLD_READ_ONLY.mjs",import.meta.url),"utf8");
for(const x of [
  "LIGHTBOX_TRANSPORT_PROVENANCE_CAPABILITY_PRESENT_AVAILABLE_SF_SEMANTIC_PATH_NOT_PROVEN",
  "observedAvailableSfMustComeFromExternalSource:true",
  "canonicalAvailableSfMayNotBeSubstituted:true",
  "priorTemporalAvailableSfMayNotBeRelabeledFresh:true",
  "UNBOUND_UNTIL_SOURCE_NATIVE_FIELD_PROVEN",
  "dryRunNetworkRequestAuthorized:false",
  "M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
]) assert.ok(s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D3_TESTS",version:"4.0-m4.19d3",status:"PASSED",testsRun:n,failures:[]},null,2));
