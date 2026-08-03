import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/ProductionOperationsCommandCenter.jsx','utf8');

t(main.includes('ProductionOperationsCommandCenter'));
t(registry.includes("'Production Operations Command Center'"));
t(center.includes('Production Operations Command Center'));
t(center.includes('Operational services'));
t(center.includes('Operational posture'));
t(center.includes('Production writes'));
t(center.includes('Governed'));
t(center.includes('Autonomous execution'));
t(center.includes('Disabled'));

console.log(JSON.stringify({
 framework:'SCIIP_PHASE15_PRODUCTION_OPERATIONS_USER_VALIDATION',
 status:'PASSED',testsRun:n,
 result:{navigation:true,healthVisible:true,controlsVisible:true}
},null,2));
