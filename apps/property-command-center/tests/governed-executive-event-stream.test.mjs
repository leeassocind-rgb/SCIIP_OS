import assert from'node:assert/strict';import{createGovernedExecutiveEventStream}from'../src/autonomous-executive/event-stream/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const stream=createGovernedExecutiveEventStream();let seen=0;stream.subscribe(()=>seen++);
const a=stream.publish({type:'MARKET_SIGNAL',subjectId:'P1',eventKey:'K1'});const b=stream.publish({type:'MARKET_SIGNAL',subjectId:'P1',eventKey:'K1'});
t(a.status==='PUBLISHED');t(b.status==='DUPLICATE_SKIPPED');t(stream.read().length===1);t(seen===1);t(stream.snapshot().duplicateSafe);t(stream.snapshot().eventSourced);t(!stream.snapshot().productionExecutionAuthorized);
console.log(JSON.stringify({framework:'SCIIP_PHASE8_SPRINT94_GOVERNED_EXECUTIVE_EVENT_STREAM',status:'PASSED',testsRun:n,result:stream.snapshot()},null,2));
