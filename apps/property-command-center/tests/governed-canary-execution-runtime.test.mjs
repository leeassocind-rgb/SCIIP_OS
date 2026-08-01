import assert from'node:assert/strict';
import{createGovernedCanaryExecutionRuntime}from'../src/controlled-autonomy/canary/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const runtime=createGovernedCanaryExecutionRuntime();
const result=runtime.execute({
  playbook:{instanceId:'PB-1-P1',steps:[{capability:'NOTIFY'},{capability:'CREATE_DRAFT'}]},
  approval:{status:'APPROVED_FOR_CANARY',reviewer:'BROKER-1'}
});
t(result.status==='CANARY_STARTED');t(result.executionAuthorized);t(!result.productionExecutionAuthorized);
t(result.run.steps.length===2);t(result.run.environment==='CANARY');
const blocked=runtime.execute({
  playbook:{instanceId:'PB-2-P2',steps:[{capability:'WRITE_PRODUCTION'}]},
  approval:{status:'APPROVED_FOR_CANARY',reviewer:'BROKER-1'}
});
t(blocked.status==='CAPABILITY_BLOCKED');t(!blocked.executionAuthorized);
t(runtime.snapshot().canaryExecutionEnabled);t(!runtime.snapshot().productionExecutionAuthorized);
console.log(JSON.stringify({framework:'SCIIP_PHASE10_SPRINT106_GOVERNED_CANARY_EXECUTION_RUNTIME',status:'PASSED',testsRun:n,result:runtime.snapshot()},null,2));
