import assert from'node:assert/strict';
import{createCrossDomainEventBus}from'../src/production-operations/event-bus/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const bus=createCrossDomainEventBus();let seen=0;
bus.subscribe('MARKET',()=>seen++);
t(bus.publish({eventId:'E1',domain:'MARKET'}).status==='PUBLISHED');
t(bus.publish({eventId:'E1',domain:'MARKET'}).status==='DUPLICATE_SKIPPED');
t(seen===1);t(bus.replay().length===1);t(bus.snapshot().duplicateSafe);t(bus.snapshot().replayable);t(bus.snapshot().crossDomain);t(!bus.snapshot().autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT152_CROSS_DOMAIN_EVENT_BUS',status:'PASSED',testsRun:n,result:bus.snapshot()},null,2));
