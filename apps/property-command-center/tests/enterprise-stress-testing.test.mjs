import assert from 'node:assert/strict';
import { runEnterpriseStressTests } from '../src/enterprise-assurance/stress/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=runEnterpriseStressTests({
  baseline:{revenue:1000,cost:600,liquidity:100,capacity:100},
  tests:[
    {testId:'S1',label:'Moderate',revenueMultiplier:.9,costMultiplier:1.05,liquidityDelta:-20,capacityMultiplier:.9},
    {testId:'S2',label:'Severe',revenueMultiplier:.5,costMultiplier:1.2,liquidityDelta:-100,capacityMultiplier:.5}
  ]
});

t(r.total===2);
t(r.vulnerable===2);
t(r.tests[0].status==='VULNERABLE');
t(r.tests[1].status==='VULNERABLE');
t(r.assumptionsVisible);
t(r.sensitivityAnalysis);
t(r.executiveReviewRequired);
t(!r.autonomousRemediationAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT254_ENTERPRISE_STRESS_TESTING',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
