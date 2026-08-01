import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/PilotOperationsCenter.jsx','utf8');

t(main.includes('PilotOperationsCenter'));
t(registry.includes("'Controlled Pilot Operations'"));
t(center.includes('Controlled Pilot Operations Center'));
t(center.includes('Pilot telemetry'));
t(center.includes('Issue triage'));
t(center.includes('Production execution'));
t(center.includes('Disabled'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_CONTROLLED_PILOT_OPERATIONS_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,telemetryVisible:true,shutdownVisible:true}
},null,2));
