import assert from 'node:assert/strict';
import { evaluateStrategicAccounts } from '../src/growth-strategy/accounts/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateStrategicAccounts({accounts:[
  {accountId:'C1',revenuePotential:95,relationshipStrength:85,assignmentPotential:90,marketFit:80},
  {accountId:'C2',revenuePotential:60,relationshipStrength:50,assignmentPotential:55,marketFit:50}
]});

t(r.total===2);
t(r.priorityGrowth===1);
t(r.topAccount.accountId==='C1');
t(r.topAccount.status==='PRIORITY_GROWTH');
t(r.evidenceBacked);
t(r.brokerReviewRequired);
t(!r.autonomousOutreachAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT241_STRATEGIC_ACCOUNT_GROWTH',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
