import assert from'node:assert/strict';
import{stressTestCapitalPlan}from'../src/phase18-capital/stress/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=stressTestCapitalPlan({
 plan:[{investmentId:'I1',expectedRevenue:100,expectedCost:60,capital:50}],
 scenarios:[
  {scenarioId:'BASE',revenueFactor:1,costFactor:1,lossFactor:0},
  {scenarioId:'STRESS',revenueFactor:.5,costFactor:1.2,lossFactor:.5}
 ]
});
t(r.total===2);t(r.scenarios[0].totalNet===40);t(r.scenarios[1].atRisk===1);
t(r.assumptionsVisible);t(r.stressEvidencePreserved);t(!r.autonomousPlanChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT334_CAPITAL_SCENARIO_STRESS_TESTING',status:'PASSED',testsRun:n,result:r},null,2));
