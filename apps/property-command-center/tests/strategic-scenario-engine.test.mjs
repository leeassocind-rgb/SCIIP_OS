import assert from'node:assert/strict';
import{buildStrategicScenarios}from'../src/phase18-scenarios/scenarios/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=buildStrategicScenarios({
 scenarios:[{scenarioId:'S1',assumptionIds:['A1','A2']},{scenarioId:'S2',assumptionIds:['A9']}],
 assumptions:[{assumptionId:'A1',confidence:.9},{assumptionId:'A2',confidence:.7}]
});
t(r.total===2);t(r.ready===1);t(r.missingAssumptions===1);t(r.scenarios[0].confidence===.8);
t(r.assumptionsVisible);t(r.permanentScenarioHistory);t(!r.autonomousScenarioSelectionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT325_STRATEGIC_SCENARIO_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
