import assert from'node:assert/strict';
import{createExecutiveAIMemory}from'../src/enterprise-ai/memory/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const memory=createExecutiveAIMemory();
t(memory.remember({memoryId:'M1',scope:'PROPERTY',subjectId:'P1',content:'Power upgrade'}).status==='PRESERVED');
t(memory.remember({memoryId:'M1',scope:'PROPERTY',subjectId:'P1',content:'Duplicate'}).status==='DUPLICATE_SKIPPED');
t(memory.remember({memoryId:'M2',scope:'MARKET',subjectId:'IE',content:'Vacancy fell'}).status==='PRESERVED');
const recall=memory.recall({scope:'PROPERTY',subjectId:'P1'});
t(recall.count===1);
t(recall.records[0].content==='Power upgrade');
t(recall.persistent);
t(recall.traceable);
t(memory.snapshot().duplicateSafe);
t(memory.snapshot().persistent);
t(!memory.snapshot().autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE16_SPRINT182_EXECUTIVE_AI_MEMORY',
  status:'PASSED',
  testsRun:n,
  result:memory.snapshot()
},null,2));
