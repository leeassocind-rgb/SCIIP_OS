import assert from 'node:assert/strict';
import { linkTemporalEvents } from '../src/production-activation/temporal-linking/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=linkTemporalEvents({
  events:[
    {id:'E1',propertyId:'P1',date:'2026-01-01'},
    {id:'E2',propertyId:'P1',date:'2026-02-01'},
    {id:'E3',propertyId:'P2',date:'2026-02-15'}
  ],
  windowDays:90
});

t(result.eventCount===3);
t(result.linkCount===1);
t(result.links[0].from==='E1');
t(result.links[0].to==='E2');
t(result.links[0].gapDays===31);
t(result.duplicateSafe);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE5_SPRINT73_TEMPORAL_EVENT_LINKING',
  status:'PASSED',
  testsRun:tests,
  result:{eventCount:result.eventCount,linkCount:result.linkCount}
},null,2));
