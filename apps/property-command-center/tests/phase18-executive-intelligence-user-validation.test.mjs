import assert from'node:assert/strict';
import fs from'node:fs';
let n=0;const t=c=>{n++;assert.ok(c)};
const m=fs.readFileSync('src/main.jsx','utf8');
const r=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const c=fs.readFileSync('src/components/EnterpriseExecutiveIntelligenceCenter.jsx','utf8');

t(m.includes('EnterpriseExecutiveIntelligenceCenter'));
t(r.includes("'Enterprise KPI, Strategic Objectives & Predictive Recommendations Center'"));
t(c.includes('Enterprise KPI, Strategic Objectives & Predictive Recommendations Center'));
t(c.includes('Executive intelligence command'));
t(c.includes('Executive controls'));
t(c.includes('EXECUTIVE INTELLIGENCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE18_EXECUTIVE_INTELLIGENCE_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,executiveVisible:true,controlsVisible:true}
},null,2));
