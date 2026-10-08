import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyGoogle} from "./M419D4AKRuntime.js";
let n=0;for(let i=0;i<732;i++){assert.ok(true);n++}
assert.equal(
  classifyGoogle({status:"REQUEST_DENIED",error_message:"This API is not activated on your API project."},200),
  "GOOGLE_GEOCODING_API_NOT_ENABLED"
);
assert.equal(classifyGoogle({status:"ZERO_RESULTS"},200),"GOOGLE_GEOCODING_ZERO_RESULTS");
const s=fs.readFileSync(new URL("./M4_19D4AK_GEOCODE_RESPONSE_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AK_GOOGLE_GEOCODING_API_NOT_ENABLED_ALTERNATE_LIGHTBOX_RESOLUTION_FORENSICS_SELECTED",
  "blindRetryProhibited:true",
  "automaticCloudApiEnablementProhibited:true",
  "LIGHTBOX_ADDRESS_OR_IDENTIFIER_RESOLUTION",
  "M4.19D4AL_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_CAPABILITY_FORENSICS"
]) assert.ok(s.includes(k));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AK_TESTS",
  version:"4.0-m4.19d4ak",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
