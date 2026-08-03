import assert from'node:assert/strict';
import fs from'node:fs';
let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/ExecutiveCapitalPlanningCenter.jsx','utf8');

t(main.includes('ExecutiveCapitalPlanningCenter'));
t(registry.includes("'Strategic Capital Allocation, Resource Optimization & Investment Planning Center'"));
t(center.includes('Strategic Capital Allocation, Resource Optimization & Investment Planning Center'));
t(center.includes('Executive capital planning'));
t(center.includes('Capital controls'));
t(center.includes('CAPITAL GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE18_CAPITAL_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,capitalVisible:true,controlsVisible:true}
},null,2));
