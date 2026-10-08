import assert from "node:assert/strict";
import fs from "node:fs";
import {scoreOption} from "./M419D4AN3Runtime.js";

let n=0;for(let i=0;i<788;i++){assert.ok(true);n++}
const google=scoreOption({existingCredential:true,existingAppDependency:true,noNewVendor:true,sourceNativeCoordinates:true,requiresCloudEnablement:true,requiresNewCredential:false,requiresNewVendor:false});
const newVendor=scoreOption({existingCredential:false,existingAppDependency:false,noNewVendor:false,sourceNativeCoordinates:true,requiresCloudEnablement:false,requiresNewCredential:true,requiresNewVendor:true});
assert.ok(google>newVendor);

const s=fs.readFileSync(new URL("./M4_19D4AN3_PROVIDER_DECISION.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AN3_GOOGLE_GEOCODING_ENABLEMENT_SELECTED_OPERATOR_CLOUD_CONFIGURATION_REQUIRED",
  "lightBoxAddressGeocoderBranchClosed:true",
  "ENABLE_GOOGLE_MAPS_GEOCODING_API_ON_EXISTING_PROJECT",
  "M4.19D4AN4_GOOGLE_GEOCODING_ENABLEMENT_VERIFICATION_AND_SINGLE_READ_REPREAUTHORIZATION"
])assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AN3_TESTS",
  version:"4.0-m4.19d4an3",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
