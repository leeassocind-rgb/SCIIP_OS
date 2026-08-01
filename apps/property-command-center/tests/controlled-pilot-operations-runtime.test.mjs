import assert from'node:assert/strict';
import{createMemoryPilotStorage,createControlledPilotOperationsRuntime}from'../src/pilot-operations/runtime/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const storage=createMemoryPilotStorage();
const runtime=createControlledPilotOperationsRuntime({storage});
runtime.startPilot({
  pilotId:'PILOT-1',
  users:[{id:'U1'}],
  datasets:[{id:'SS-1'}],
  approvals:[{id:'A1',status:'APPROVED'}]
});
t(runtime.snapshot().status==='ACTIVE');
t(runtime.snapshot().activeSessionId==='PILOT-1');
t(runtime.getSnapshot().users.length===1);
t(runtime.getSnapshot().datasets.length===1);
t(runtime.snapshot().governed);
t(!runtime.snapshot().productionExecutionAuthorized);
runtime.stopPilot({pilotId:'PILOT-1',reason:'Completed',approvedBy:'ADMIN-1'});
t(runtime.snapshot().status==='IDLE');
t(runtime.getSnapshot().sessions[0].status==='STOPPED');
const recovered=createControlledPilotOperationsRuntime({storage});
t(recovered.getSnapshot().revision===2);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT130_CONTROLLED_PILOT_OPERATIONS_RUNTIME',
  status:'PASSED',testsRun:n,result:runtime.snapshot()
},null,2));
