import assert from 'node:assert/strict';
import { simulateEnterpriseScenarios } from '../src/enterprise-planning/scenarios/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=simulateEnterpriseScenarios({
  baseline:{revenue:1000,cost:600,risk:20},
  scenarios:[
    {scenarioId:'BASE',label:'Base',revenueMultiplier:1,costMultiplier:1,riskDelta:0},
    {scenarioId:'UPSIDE',label:'Upside',revenueMultiplier:1.2,costMultiplier:1.05,riskDelta:5}
  ]
});

t(r.total===2);
t(r.bestScenario.scenarioId==='UPSIDE');
t(r.bestScenario.net===570);
t(r.assumptionsVisible);
t(r.sensitivityAnalysis);
t(r.evidencePreserved);
t(r.approvalRequired);
t(!r.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT249_ENTERPRISE_SCENARIO_SIMULATOR',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
