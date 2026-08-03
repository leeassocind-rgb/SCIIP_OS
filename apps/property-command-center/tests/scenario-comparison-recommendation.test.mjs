import assert from'node:assert/strict';
import{compareScenarios}from'../src/phase18-scenarios/comparison/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=compareScenarios({scenarios:[
 {scenarioId:'S1',valueScore:90,resilienceScore:85,confidence:.9,riskScore:20},
 {scenarioId:'S2',valueScore:95,resilienceScore:70,confidence:.5,riskScore:10}
]});
t(r.total===2);t(r.reviewReady===1);t(r.recommendedScenario.scenarioId==='S1');
t(r.assumptionsVisible);t(r.executiveApprovalRequired);t(!r.autonomousScenarioSelectionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT328_SCENARIO_COMPARISON_RECOMMENDATION',status:'PASSED',testsRun:n,result:r},null,2));
