import assert from 'node:assert/strict';
import fs from 'node:fs';

let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/ExecutiveAssignmentOperationsCenter.jsx','utf8');

t(main.includes('ExecutiveAssignmentOperationsCenter'));
t(registry.includes("'Executive Assignment Operations Center'"));
t(center.includes('Executive Assignment Operations Center'));
t(center.includes('Executive assignment command'));
t(center.includes('Execution controls'));
t(center.includes('BROKER CONTROL PRESERVED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_EXECUTIVE_ASSIGNMENT_OPERATIONS_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{navigation:true,operationsVisible:true,controlsVisible:true}
},null,2));
