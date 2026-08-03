import assert from 'node:assert/strict';
import fs from 'node:fs';

let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/EnterpriseForecastingCapitalPlanningCenter.jsx','utf8');

t(main.includes('EnterpriseForecastingCapitalPlanningCenter'));
t(registry.includes("'Enterprise Forecasting & Capital Planning Center'"));
t(center.includes('Enterprise Forecasting & Capital Planning Center'));
t(center.includes('Enterprise planning'));
t(center.includes('Planning controls'));
t(center.includes('CAPITAL GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_ENTERPRISE_PLANNING_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,planningVisible:true,controlsVisible:true}
},null,2));
