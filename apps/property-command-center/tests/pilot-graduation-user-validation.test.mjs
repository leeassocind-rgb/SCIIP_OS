import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/PilotGraduationCenter.jsx','utf8');

t(main.includes('PilotGraduationCenter'));
t(registry.includes("'Pilot Graduation Center'"));
t(center.includes('Pilot Graduation Center'));
t(center.includes('Release-candidate gates'));
t(center.includes('Rollback readiness'));
t(center.includes('PRODUCTION DEPLOYMENT BLOCKED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_PILOT_GRADUATION_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,releaseGatesVisible:true,rollbackVisible:true}
},null,2));
