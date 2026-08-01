import assert from'node:assert/strict';
import{createMemoryEnterpriseOSStorage,createLiveEnterpriseOSRuntime}from'../src/enterprise-os/runtime/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const storage=createMemoryEnterpriseOSStorage();
const runtime=createLiveEnterpriseOSRuntime({storage});
runtime.ingestEnterpriseSnapshot({
  portfolio:[{id:'P1'}],
  markets:[{id:'M1'}],
  workflows:[{id:'W1',status:'IN_PROGRESS'}],
  decisions:[{id:'D1'}],
  capital:{available:100,allocated:40},
  risks:[{id:'R1',severity:'HIGH',status:'OPEN'}],
  opportunities:[{id:'O1',status:'ACTIVE'}]
});
const state=runtime.getSnapshot();
t(state.enterprise.portfolio.length===1);
t(state.enterprise.workflows.length===1);
t(state.enterprise.capital.available===100);
t(state.health==='WATCH');
t(state.revision===1);
t(runtime.snapshot().persistent);
t(runtime.snapshot().synchronized);
t(runtime.snapshot().enterpriseDigitalTwin);
t(!runtime.snapshot().productionExecutionAuthorized);

const recovered=createLiveEnterpriseOSRuntime({storage});
t(recovered.getSnapshot().revision===1);
t(recovered.getSnapshot().enterprise.opportunities.length===1);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_SPRINT124_LIVE_ENTERPRISE_OS_RUNTIME',
  status:'PASSED',testsRun:n,result:runtime.snapshot()
},null,2));
