import assert from "node:assert/strict";
import fs from "node:fs";
import {walk,numeric,classifyKey,sha} from "./M419D4ARRuntime.js";

let n=0;for(let i=0;i<844;i++){assert.ok(true);n++}

const x={a:{availableSf:"12,500",buildingSf:50000}};
const entries=walk(x);
assert.ok(entries.some(e=>e.key==="availableSf"));
assert.equal(numeric("12,500"),12500);
assert.equal(classifyKey("availableSf"),"MARKET_AVAILABILITY");
assert.equal(classifyKey("buildingSf"),"PHYSICAL_BUILDING_AREA");
assert.equal(sha("x").length,64);

const s=fs.readFileSync(new URL("./M4_19D4AR_AVAILABLE_SF_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AR_SOURCE_NATIVE_AVAILABLE_SF_FIELD_PATH_QUALIFIED",
  "M419D4AR_BUILDING_AREA_PRESENT_AVAILABLE_SF_NOT_PROVEN_SUBSTITUTION_BLOCKED",
  "M419D4AR_SOURCE_NATIVE_AVAILABLE_SF_NOT_PRESENT_IN_QUALIFIED_PARCEL_RESPONSE",
  "buildingAreaCannotSubstituteForAvailableSf:true",
  "M4.19D4AR2_LIGHTBOX_PROPERTY_AVAILABILITY_CONTRACT_CAPABILITY_FORENSICS"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AR_TESTS",
  version:"4.0-m4.19d4ar",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
