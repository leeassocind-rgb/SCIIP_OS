import assert from'node:assert/strict';
import{createCrossWorkspaceIntelligence}from'../src/enterprise-ai/cross-workspace/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const intelligence=createCrossWorkspaceIntelligence();
let observed=0;
intelligence.subscribe(()=>observed++);
const first=intelligence.publish({assignmentId:'A1',propertyId:'P1'});
const second=intelligence.publish({workspace:'GIS Intelligence'});
t(first.revision===1);
t(second.revision===2);
t(second.assignmentId==='A1');
t(second.propertyId==='P1');
t(second.workspace==='GIS Intelligence');
t(observed===2);
t(intelligence.snapshot().history.length===2);
t(intelligence.snapshot().crossWorkspace);
t(intelligence.snapshot().persistentContext);
t(intelligence.snapshot().eventOrchestrated);
t(!intelligence.snapshot().autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE16_SPRINT185_CROSS_WORKSPACE_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result:intelligence.snapshot()
},null,2));
