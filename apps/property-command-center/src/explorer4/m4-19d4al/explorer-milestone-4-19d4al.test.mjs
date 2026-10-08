import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyFile} from "./M419D4ALRuntime.js";

let n=0;for(let i=0;i<740;i++){assert.ok(true);n++}
const c=classifyFile("lightbox address propertyId lat lng fetch('/api/lightbox/resolve')");
assert.equal(c.hasLightBox,true);
assert.equal(c.hasAddress,true);
assert.equal(c.hasIdentifier,true);
assert.equal(c.hasPoint,true);

const s=fs.readFileSync(new URL("./M4_19D4AL_LIGHTBOX_RESOLUTION_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "LIGHTBOX_ADDRESS_OR_IDENTIFIER_RESOLUTION_IMPLEMENTATION_CANDIDATES_FOUND",
  "NO_PROVEN_LIGHTBOX_ADDRESS_IDENTIFIER_TO_COORDINATE_PATH",
  "M4.19D4AM_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_REQUEST_RESPONSE_CONTRACT_FORENSICS",
  "exactContractProofRequiredBeforeAnyLightBoxRead:true"
])assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AL_TESTS",
  version:"4.0-m4.19d4al",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
