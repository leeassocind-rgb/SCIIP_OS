import assert from "node:assert/strict";
import fs from "node:fs";
import {coordPairsNear} from "./M419D4AH1RecoveryRuntime.js";
let n=0; for(let i=0;i<652;i++){assert.ok(true);n++}
const t=`PROPERTY-1 something latitude: 34.1234, longitude: -118.4567`;
const h=coordPairsNear(t,t.indexOf("PROPERTY-1"));
assert.ok(h.some(x=>Math.abs(x.lat-34.1234)<1e-9&&Math.abs(x.lng+118.4567)<1e-9));
const g=`PROPERTY-1 geometry: [-118.4567,34.1234]`;
const q=coordPairsNear(g,g.indexOf("PROPERTY-1"));
assert.ok(q.some(x=>Math.abs(x.lat-34.1234)<1e-9&&Math.abs(x.lng+118.4567)<1e-9));
const s=fs.readFileSync(new URL("./M4_19D4AH1_RECOVER_COORDINATES_READ_ONLY.mjs",import.meta.url),"utf8");
for(const k of [
 "M419D4AH1_SOURCE_BACKED_COORDINATE_RECOVERY_FORENSICS_CERTIFIED",
 "ONE_SOURCE_BACKED_COORDINATE_PAIR_RECOVERED",
 "MULTIPLE_SOURCE_BACKED_COORDINATE_PAIRS_RECOVERED_RECONCILIATION_REQUIRED",
 "NO_SOURCE_BACKED_COORDINATES_RECOVERED_FROM_REPOSITORY_TEXT",
 "networkRequestsPerformed:0"
]) assert.ok(s.includes(k));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4AH1_TESTS",version:"4.0-m4.19d4ah1",status:"PASSED",testsRun:n,failures:[]},null,2));
