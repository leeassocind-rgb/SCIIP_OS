import assert from'node:assert/strict';import{instantiateExecutivePlaybook}from'../src/autonomous-executive/playbooks/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const p=instantiateExecutivePlaybook({template:{playbookId:'PB-OPP',name:'Opportunity Review',steps:[{capability:'QUALIFY'},{capability:'MAP'}]},context:{subjectId:'P1'}});
t(p.steps.length===2);t(p.status==='READY_FOR_REVIEW');t(p.approvalRequired);t(!p.executionAuthorized);t(p.rollbackRequired);
console.log(JSON.stringify({framework:'SCIIP_PHASE8_SPRINT96_GOVERNED_EXECUTIVE_PLAYBOOKS',status:'PASSED',testsRun:n,result:p},null,2));
