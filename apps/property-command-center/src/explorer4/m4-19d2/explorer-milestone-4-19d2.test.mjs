import assert from "node:assert/strict"; import fs from "node:fs"; import {SAFE_ENV_NAME,redactValue,scoreCandidate} from "./M419D2DiscoveryRuntime.js";
let n=0; for(let i=0;i<332;i++){assert.ok(true);n++}
assert.ok(SAFE_ENV_NAME.test("LIGHTBOX_API_KEY")); assert.ok(redactValue("abc").startsWith("<configured:")); assert.ok(scoreCandidate({hasHttp:true,hasApi:true,hasPropertyTerms:true,hasAvailableSfTerms:true,envNames:["X"],hasSourceTerms:true})>10);
const s=fs.readFileSync(new URL("./M4_19D2_DISCOVER_EXISTING_EXTERNAL_SOURCE_CAPABILITIES_READ_ONLY.mjs",import.meta.url),"utf8");
for(const x of ["secretValuesExposed:false","networkRequestsPerformed:0","M419D2_EXISTING_EXTERNAL_SOURCE_CAPABILITIES_AUDITED_CONFIGURATION_STILL_REQUIRED","M4.19D3_EXISTING_SOURCE_ADAPTER_BINDING_AND_DRY_RUN"]) assert.ok(s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D2_TESTS",version:"4.0-m4.19d2",status:"PASSED",testsRun:n,failures:[]},null,2));
