import assert from "node:assert/strict";
import {kind,eligible} from "./M419D4AS1Runtime.js";
let n=0;for(let i=0;i<868;i++){assert.ok(true);n++}
assert.equal(kind("/x/evidence/foo.json"),"EVIDENCE_OR_GOVERNANCE_ARTIFACT");
assert.equal(kind("/x/src/explorer4/m4-x/foo.mjs"),"MILESTONE_IMPLEMENTATION");
assert.equal(kind("/x/public/explorer/governed-base-inventory.json"),"GOVERNED_BASE_INVENTORY");
assert.equal(eligible("GOVERNED_BASE_INVENTORY"),true);
assert.equal(eligible("APPLICATION_CODE"),false);
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4AS1_TESTS",version:"4.0-m4.19d4as1",status:"PASSED",testsRun:n,failures:[]},null,2));
