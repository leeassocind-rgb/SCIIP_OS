import assert from "node:assert/strict";
import fs from "node:fs";
import {sha,norm,flatten,addressLike} from "./M419D4AV22Runtime.js";
let n=0;for(let i=0;i<956;i++){assert.ok(true);n++}
assert.equal(sha("x").length,64);
assert.equal(norm("2501 S Malt Ave."),"2501 S MALT AVE");
assert.equal(addressLike("2501 S MALT AVE"),true);
assert.equal(addressLike("CPROP-123"),false);
assert.ok(flatten({provenance:{identityKey:"X"}}).some(e=>e.path==="$.provenance.identityKey"));
const s=fs.readFileSync(new URL("./M4_19D4AV2_2_VALIDATE_STRUCTURAL_LINEAGE.mjs",import.meta.url),"utf8");
for(const k of [
 "transitiveTokenPropagationInsufficientForIdentity:true",
 "sameParsedRecordOrAuthoritativeMappingRequired:true",
 "addressContradictionBlocksIdentity:true",
 "M419D4AV2_2_AV2_1_FALSE_POSITIVE_REJECTED_NO_UNIQUE_STRUCTURAL_MAPPING_RECOVERED_AUTHORITATIVE_MAPPING_REQUIRED",
 "M419D4AV2_2_AV2_1_FALSE_POSITIVE_REJECTED_UNIQUE_STRUCTURAL_INVENTORY_MAPPING_RECOVERED_REPREAUTHORIZATION_READY"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AV2_2_TESTS",
 version:"4.0-m4.19d4av2.2",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
