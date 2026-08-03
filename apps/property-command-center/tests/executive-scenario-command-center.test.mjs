import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveScenarioCommand}from'../src/phase18-scenarios/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveScenarioCommand({
 scenarios:{scenarios:[{scenarioId:'S1',status:'ASSUMPTIONS_MISSING'}]},
 forecasts:{forecasts:[{seriesId:'F1',assumptionsVisible:false}]},
 simulation:{assets:[{assetId:'A1',status:'AT_RISK'}]},
 comparison:{scenarios:[{scenarioId:'S2',status:'LOW_CONFIDENCE'}]},
 approvals:[{approvalId:'AP1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.executiveScenarioCommandReady);t(r.executiveApprovalRequired);
t(!r.autonomousScenarioSelectionAllowed);t(!r.autonomousReallocationAllowed);
const source=fs.readFileSync('src/components/ExecutiveScenarioPlanningCenter.jsx','utf8');
t(source.includes('Executive Scenario Planning, Strategic Forecasting & Portfolio Simulation Center'));
t(source.includes('SCENARIO GOVERNANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT329_EXECUTIVE_SCENARIO_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
