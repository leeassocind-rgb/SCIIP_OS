import assert from'node:assert/strict';
import{createLiveEnterpriseOSRuntime}from'../src/enterprise-os/runtime/index.js';
import{createLiveMissionControlAdapter}from'../src/enterprise-os/mission-control/liveIndex.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const runtime=createLiveEnterpriseOSRuntime();
runtime.ingestEnterpriseSnapshot({
  portfolio:[{id:'P1'},{id:'P2'}],
  workflows:[{id:'W1',status:'IN_PROGRESS'}],
  capital:{available:200,allocated:75},
  risks:[{id:'R1',severity:'CRITICAL',status:'OPEN'}],
  opportunities:[{id:'O1',status:'ACTIVE'}]
});
const adapter=createLiveMissionControlAdapter({runtime});
const view=adapter.read();

t(view.liveData);
t(!view.stale);
t(view.runtimeRevision===1);
t(view.portfolioAssets===2);
t(view.activeWorkflows===1);
t(view.capitalAvailable===200);
t(view.capitalAllocated===75);
t(view.criticalRisks===1);
t(view.activeOpportunities===1);
t(adapter.snapshot().reactive);
t(!adapter.snapshot().productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_SPRINT125_MISSION_CONTROL_LIVE_DATA_WIRING',
  status:'PASSED',testsRun:n,result:view
},null,2));
