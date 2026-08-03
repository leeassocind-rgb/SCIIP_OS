import assert from'node:assert/strict';
import{executeControlledActions}from'../src/phase18-execution/runtime/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=executeControlledActions({
 dryRun:true,
 actions:[{actionId:'ACT-1',blocked:false},{actionId:'ACT-2',blocked:true}],
 approvals:[{actionId:'ACT-1',status:'APPROVED'}]
});
t(r.total===2);t(r.executable===1);t(r.executed===0);t(r.actions[0].status==='DRY_RUN_READY');t(r.actions[1].status==='BLOCKED');t(r.rollbackRequired);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT309_CONTROLLED_EXECUTION_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
