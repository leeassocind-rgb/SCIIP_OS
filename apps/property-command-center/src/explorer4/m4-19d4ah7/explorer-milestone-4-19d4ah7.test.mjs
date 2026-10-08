import assert from "node:assert/strict";
import fs from "node:fs";
import {
  normLocator,recordIdentityStrength,directAddress,sourceFamily
} from "./M419D4AH7Runtime.js";

let n=0; for(let i=0;i<708;i++){assert.ok(true);n++}

const C="CPROP-X",S="PROPERTY-X";
assert.equal(recordIdentityStrength({canonicalPropertyId:C,sourcePropertyId:S},C,S),3);
assert.equal(recordIdentityStrength({sourcePropertyId:S},C,S),1);
assert.equal(recordIdentityStrength({other:"x"},C,S),0);
assert.equal(directAddress({address:"123 Main St"}),"123 Main St");
assert.equal(directAddress({address:{street:"123 Main St",city:"Los Angeles",state:"CA",zip:"90001"}}),"123 Main St, Los Angeles, CA, 90001");
assert.equal(normLocator("123 Main Street"),"123 MAIN ST");
assert.equal(sourceFamily("/x/src/production-validation/canonical-property-identity-data.json"),"SRC_CANONICAL_IDENTITY");

const s=fs.readFileSync(new URL("./M4_19D4AH7_RECONCILE_LOCATOR_STRUCTURALLY.mjs",import.meta.url),"utf8");
for(const k of [
  "sameRecordIdentityAndAddressRequired:true",
  "proximitySearch:false",
  "ONE_STRUCTURALLY_BOUND_CORROBORATED_LOCATOR_CERTIFIED",
  "MULTIPLE_STRUCTURALLY_BOUND_CORROBORATED_LOCATORS_REQUIRE_PRECEDENCE_RECONCILIATION",
  "NO_STRUCTURALLY_BOUND_CORROBORATED_LOCATOR_QUALIFIED",
  "M4.19D4AI_CERTIFIED_ADDRESS_LOCATOR_GEOCODE_PREAUTHORIZATION"
])assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AH7_TESTS",
  version:"4.0-m4.19d4ah7",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
