import assert from 'node:assert/strict';
import { runPipelineScenarios } from '../src/growth-strategy/scenarios/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=runPipelineScenarios({
  deals:[
    {dealId:'D1',revenue:100000,probability:.5},
    {dealId:'D2',revenue:200000,probability:.4}
  ],
  scenarios:[
    {scenarioId:'BASE',label:'Base',probabilityMultiplier:1,revenueMultiplier:1},
    {scenarioId:'UPSIDE',label:'Upside',probabilityMultiplier:1.2,revenueMultiplier:1.1}
  ]
});

t(r.total===2);
t(r.bestScenario.scenarioId==='UPSIDE');
t(r.bestScenario.weightedRevenue>r.scenarios[1].weightedRevenue);
t(r.assumptionsVisible);
t(r.evidenceRequired);
t(r.approvalRequired);
t(!r.autonomousCommitmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT243_PIPELINE_SCENARIO_PLANNING',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
