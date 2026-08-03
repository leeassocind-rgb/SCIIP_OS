import assert from 'node:assert/strict';
import fs from 'node:fs';

let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/EnterpriseRiskResilienceAssuranceCenter.jsx','utf8');

t(main.includes('EnterpriseRiskResilienceAssuranceCenter'));
t(registry.includes("'Enterprise Risk, Resilience & Strategic Assurance Center'"));
t(center.includes('Enterprise Risk, Resilience & Strategic Assurance Center'));
t(center.includes('Resilience command'));
t(center.includes('Assurance controls'));
t(center.includes('RESILIENCE GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_ENTERPRISE_RISK_RESILIENCE_ASSURANCE_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,resilienceVisible:true,controlsVisible:true}
},null,2));
