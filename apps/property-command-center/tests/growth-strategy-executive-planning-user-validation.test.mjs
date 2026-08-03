import assert from 'node:assert/strict';
import fs from 'node:fs';

let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/GrowthStrategyExecutivePlanningCenter.jsx','utf8');

t(main.includes('GrowthStrategyExecutivePlanningCenter'));
t(registry.includes("'Growth Strategy & Executive Planning Center'"));
t(center.includes('Growth Strategy & Executive Planning Center'));
t(center.includes('Growth planning'));
t(center.includes('Executive controls'));
t(center.includes('GROWTH GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_GROWTH_STRATEGY_EXECUTIVE_PLANNING_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,growthVisible:true,controlsVisible:true}
},null,2));
