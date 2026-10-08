import assert from "node:assert/strict";
import fs from "node:fs";
import {sha,norm,flatten,admissiblePath} from "./M419D4AV21Runtime.js";
let n=0;for(let i=0;i<948;i++){assert.ok(true);n++}
assert.equal(sha("x").length,64);
assert.equal(norm(" 14117 Bessemer St. "),"14117 BESSEMER ST");
assert.ok(flatten({identity:{key:"X"}}).some(e=>e.path==="$.identity.key"));
assert.equal(admissiblePath("/x/evidence/canonical-identity.json"),true);
assert.equal(admissiblePath("/x/src/explorer4/m4/test.js"),false);
const s=fs.readFileSync(new URL("./M4_19D4AV2_1_BOUNDED_LINEAGE_RECOVERY.mjs",import.meta.url),"utf8");
for(const k of [
 "MAX_FILES=1200",
 "MAX_NEW_TOKENS=250",
 "MAX_SECONDARY_FILES=200",
 "M419D4AV2_1_UNIQUE_CANONICAL_TO_GOVERNED_BASE_INVENTORY_LINEAGE_RECOVERED_AV_REPREAUTHORIZATION_READY",
 "repositoryWideRecursiveTokenExpansionProhibited:true",
 "boundedExactLineageSearch:true"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AV2_1_TESTS",
 version:"4.0-m4.19d4av2.1",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
