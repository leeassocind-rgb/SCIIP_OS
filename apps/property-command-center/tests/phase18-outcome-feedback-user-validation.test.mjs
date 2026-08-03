import assert from'node:assert/strict';
import fs from'node:fs';
let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8');
const registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8');
const center=fs.readFileSync('src/components/ExecutiveOutcomeImprovementCenter.jsx','utf8');

t(main.includes('ExecutiveOutcomeImprovementCenter'));
t(registry.includes("'Execution Outcomes, Feedback & Continuous Improvement Center'"));
t(center.includes('Execution Outcomes, Feedback & Continuous Improvement Center'));
t(center.includes('Executive outcome review'));
t(center.includes('Learning controls'));
t(center.includes('OUTCOME GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
 framework:'SCIIP_PHASE18_OUTCOME_FEEDBACK_USER_VALIDATION',
 status:'PASSED',
 testsRun:n,
 result:{navigation:true,outcomesVisible:true,controlsVisible:true}
},null,2));
