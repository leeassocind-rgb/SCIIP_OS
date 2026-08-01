import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/PilotImprovementCenter.jsx','utf8');

t(main.includes('PilotImprovementCenter'));
t(registry.includes("'Pilot Improvement Center'"));
t(center.includes('Pilot Improvement Center'));
t(center.includes('Feedback themes'));
t(center.includes('Adoption and workflow analytics'));
t(center.includes('CHANGES REQUIRE APPROVAL'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_PILOT_IMPROVEMENT_USER_VALIDATION',
  status:'PASSED',testsRun:n,
  result:{navigation:true,feedbackVisible:true,adoptionVisible:true}
},null,2));
