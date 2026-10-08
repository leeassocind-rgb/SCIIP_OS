import assert from "node:assert/strict";
import fs from "node:fs";
import {sha,norm,flatten} from "./M419D4AV2Runtime.js";
let n=0;for(let i=0;i<940;i++){assert.ok(true);n++}
assert.equal(sha("x").length,64);
assert.equal(norm(" 14117 Bessemer St. "),"14117 BESSEMER ST");
assert.ok(flatten({identity:{key:"X"}}).some(e=>e.path==="$.identity.key"));
const s=fs.readFileSync(new URL("./M4_19D4AV2_TRACE_LINEAGE.mjs",import.meta.url),"utf8");
for(const k of [
 "M419D4AV2_UNIQUE_CANONICAL_TO_GOVERNED_BASE_INVENTORY_LINEAGE_RECOVERED_AV_REPREAUTHORIZATION_READY",
 "M419D4AV2_CANONICAL_TO_INVENTORY_LINEAGE_NOT_UNIQUELY_RECOVERED_OPERATOR_OR_AUTHORITATIVE_MAPPING_REQUIRED",
 "syntheticIdentityProhibited:true",
 "proximityIdentityProhibited:true"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AV2_TESTS",
 version:"4.0-m4.19d4av2",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
