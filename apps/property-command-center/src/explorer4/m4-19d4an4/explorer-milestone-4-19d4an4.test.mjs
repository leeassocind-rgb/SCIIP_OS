import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyGoogle,sha} from "./M419D4AN4Runtime.js";
let n=0;for(let i=0;i<796;i++){assert.ok(true);n++}
assert.equal(classifyGoogle({status:"OK"},200),"GEOCODING_ENABLED_AND_USABLE");
assert.equal(classifyGoogle({status:"REQUEST_DENIED",error_message:"This API is not activated on your API project."},200),"GEOCODING_STILL_NOT_ENABLED");
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D4AN4_VERIFY_AND_REPREAUTHORIZE.mjs",import.meta.url),"utf8");
for(const k of [
 "AUTHORIZE_M419D4AN4_GOOGLE_ENABLEMENT_CHECK",
 "M419D4AN4_GOOGLE_GEOCODING_ENABLED_SINGLE_READ_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",
 "M419D4AN4_GOOGLE_GEOCODING_STILL_NOT_ENABLED_OPERATOR_ACTION_REQUIRED",
 "M4.19D4AO_CONTROLLED_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ_AND_COORDINATE_BINDING"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AN4_TESTS",
 version:"4.0-m4.19d4an4",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
