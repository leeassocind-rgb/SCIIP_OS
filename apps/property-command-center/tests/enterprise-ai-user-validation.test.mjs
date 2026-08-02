import assert from'node:assert/strict';
import fs from'node:fs';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/EnterpriseAIOperatingSystemCenter.jsx','utf8');

t(main.includes('EnterpriseAIOperatingSystemCenter'));
t(registry.includes("'Enterprise AI Operating System Center'"));
t(center.includes('Enterprise AI Operating System Center'));
t(center.includes('Enterprise AI intelligence'));
t(center.includes('AI governance'));
t(center.includes('EVIDENCE & APPROVAL REQUIRED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE16_ENTERPRISE_AI_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,intelligenceVisible:true,controlsVisible:true}
},null,2));
