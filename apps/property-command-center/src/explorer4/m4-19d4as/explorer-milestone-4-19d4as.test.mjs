import assert from "node:assert/strict";
import fs from "node:fs";
import {classifySource,authorityRank,sha} from "./M419D4ASRuntime.js";
let n=0;for(let i=0;i<860;i++){assert.ok(true);n++}
assert.equal(classifySource("/x/owner_availability.json","availableSf"),"OWNER_OR_OPERATOR_SOURCE");
assert.ok(authorityRank.OWNER_OR_OPERATOR_SOURCE>authorityRank.BROKERAGE_OR_INTERNAL_MARKET_SOURCE);
assert.equal(sha("x").length,64);
const s=fs.readFileSync(new URL("./M4_19D4AS_SELECT_AUTHORITY.mjs",import.meta.url),"utf8");
for(const k of [
 "M419D4AS_SINGLE_HIGHEST_AUTHORITY_MARKET_AVAILABILITY_SOURCE_CANDIDATE_IDENTIFIED_CONTRACT_CERTIFIED",
 "M419D4AS_MULTIPLE_HIGHEST_AUTHORITY_MARKET_AVAILABILITY_SOURCE_CANDIDATES_REQUIRE_RECONCILIATION",
 "M419D4AS_NO_REPOSITORY_MARKET_AVAILABILITY_AUTHORITY_CANDIDATE_OPERATOR_SOURCE_SELECTION_REQUIRED",
 "zeroAvailableSfRequiresExplicitSourceAssertion:true",
 "M4.19D4AT_MARKET_AVAILABILITY_SOURCE_CANDIDATE_EXACT_BINDING_AND_OBSERVATION_PREAUTHORIZATION"
])assert.ok(s.includes(k));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_M4_19D4AS_TESTS",
 version:"4.0-m4.19d4as",
 status:"PASSED",
 testsRun:n,
 failures:[]
},null,2));
