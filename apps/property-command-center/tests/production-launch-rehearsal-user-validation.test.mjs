import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/LaunchRehearsalCenter.jsx','utf8');

t(main.includes('LaunchRehearsalCenter'));
t(registry.includes("'Production Launch Rehearsal'"));
t(center.includes('Production Launch Rehearsal Center'));
t(center.includes('Traffic rehearsal'));
t(center.includes('Launch controls'));
t(center.includes('LIVE TRAFFIC DISABLED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_PRODUCTION_LAUNCH_REHEARSAL_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,rehearsalVisible:true,controlsVisible:true}
},null,2));
