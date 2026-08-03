import assert from'node:assert/strict';
import{allocateStrategicCapital}from'../src/phase18-capital/allocation/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=allocateStrategicCapital({
 capitalLimit:100,
 initiatives:[
  {initiativeId:'I1',valueScore:90,confidence:.9,riskScore:20,cost:60},
  {initiativeId:'I2',valueScore:80,confidence:.8,riskScore:30,cost:50}
 ]
});
t(r.total===2);t(r.allocated===1);t(r.deferred===1);t(r.capitalAllocated===60);
t(r.capitalRemaining===40);t(r.assumptionsVisible);t(!r.autonomousAllocationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT331_STRATEGIC_CAPITAL_ALLOCATION_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
