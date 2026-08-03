import assert from'node:assert/strict';
import{buildGovernedActionPlan}from'../src/phase18-execution/planning/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=buildGovernedActionPlan({
 recommendations:[{recommendationId:'R1',label:'Call client',priority:90},{recommendationId:'R2',label:'Update comp set',priority:70}],
 constraints:[{recommendationId:'R2',status:'BLOCKED'}]
});
t(r.total===2);t(r.planned===1);t(r.blocked===1);t(r.actions[0].recommendationId==='R1');t(r.approvalRequired);t(r.permanentHistory);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT307_GOVERNED_ACTION_PLANNER',status:'PASSED',testsRun:n,result:r},null,2));
