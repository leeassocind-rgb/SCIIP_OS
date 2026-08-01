import assert from'node:assert/strict';
import{evaluateAutomationPolicy}from'../src/production-operations/policies/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateAutomationPolicy({
 action:{actionId:'A1',evidence:[{}],approvalStatus:'APPROVED'},
 policy:{evidenceRequired:true,approvalRequired:true,productionWrite:false,autonomousExecutionAllowed:false}
});
t(r.actionId==='A1');t(r.allowed);t(r.reasons.length===0);t(r.evidenceRequired);t(r.approvalRequired);t(!r.autonomousExecutionAllowed);
const blocked=evaluateAutomationPolicy({
 action:{actionId:'A2',evidence:[],approvalStatus:'PENDING'},
 policy:{evidenceRequired:true,approvalRequired:true,productionWrite:true,autonomousExecutionAllowed:false}
});
t(!blocked.allowed);t(blocked.reasons.length===3);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT154_PRODUCTION_AUTOMATION_POLICIES',status:'PASSED',testsRun:n,result:{allowed:r,blocked}},null,2));
