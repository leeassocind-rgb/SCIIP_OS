import assert from 'node:assert/strict';
import { evaluateCapitalAllocation } from '../src/enterprise-planning/capital/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateCapitalAllocation({
  capitalBudget:100,
  opportunities:[
    {opportunityId:'O1',expectedReturn:90,riskScore:20,strategicFit:85,capitalRequired:60},
    {opportunityId:'O2',expectedReturn:70,riskScore:30,strategicFit:75,capitalRequired:50}
  ]
});

t(r.opportunities.length===2);
t(r.selectedCount===1);
t(r.capitalAllocated===60);
t(r.remainingCapital===40);
t(r.opportunities[0].status==='RECOMMENDED');
t(r.evidenceBacked);
t(r.executiveApprovalRequired);
t(!r.autonomousCapitalDeploymentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT248_CAPITAL_ALLOCATION_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
