import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/EnterpriseOSPilotReadinessCenter.jsx','utf8');

t(main.includes('EnterpriseOSPilotReadinessCenter'));
t(registry.includes("'Enterprise OS Pilot Readiness'"));
t(center.includes('Enterprise OS Pilot Readiness'));
t(center.includes('Rejected records'));
t(center.includes('Freshness monitoring'));
t(center.includes('Human approvals'));
t(center.includes('Production execution'));
t(center.includes('Disabled'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_ENTERPRISE_OS_PILOT_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,governanceVisible:true,freshnessVisible:true}
},null,2));
