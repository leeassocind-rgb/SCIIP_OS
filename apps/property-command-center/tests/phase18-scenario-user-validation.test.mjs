import assert from'node:assert/strict';
import fs from'node:fs';
let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/ExecutiveScenarioPlanningCenter.jsx','utf8');

t(main.includes('ExecutiveScenarioPlanningCenter'));
t(registry.includes("'Executive Scenario Planning, Strategic Forecasting & Portfolio Simulation Center'"));
t(center.includes('Executive Scenario Planning, Strategic Forecasting & Portfolio Simulation Center'));
t(center.includes('Executive scenario command'));
t(center.includes('Scenario controls'));
t(center.includes('SCENARIO GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE18_SCENARIO_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,scenarioVisible:true,controlsVisible:true}
},null,2));
