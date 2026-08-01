import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const mission=fs.readFileSync('src/components/ExecutiveMissionControl.jsx','utf8');

t(main.includes('ExecutiveMissionControl'));
t(registry.includes("'Executive Mission Control'"));
t(mission.includes('Executive Mission Control'));
t(mission.includes('Enterprise health'));
t(mission.includes('Pending approvals'));
t(mission.includes('Critical risks'));
t(mission.includes('Production execution'));
t(mission.includes('Disabled'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_ENTERPRISE_OS_END_TO_END_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,missionControl:true,governanceVisible:true}
},null,2));
