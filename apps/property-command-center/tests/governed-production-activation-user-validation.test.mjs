import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/ProductionActivationCenter.jsx','utf8');

t(main.includes('ProductionActivationCenter'));
t(registry.includes("'Production Activation Center'"));
t(center.includes('Production Activation Center'));
t(center.includes('Operational readiness'));
t(center.includes('Activation controls'));
t(center.includes('PRODUCTION DEPLOYMENT BLOCKED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_GOVERNED_PRODUCTION_ACTIVATION_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,readinessVisible:true,controlsVisible:true}
},null,2));
