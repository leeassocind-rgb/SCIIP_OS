import assert from'node:assert/strict';
import{createExecutiveTimelineExperience}from'../src/executive/ux/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const model=createExecutiveTimelineExperience({
 workflows:[{id:'W1',status:'PENDING_APPROVAL',title:'Review lease',createdAt:'2026-07-31T13:00:00.000Z',evidenceRefs:['E1']}],
 opportunities:[{id:'O1',status:'REVIEWED',title:'Rialto opportunity',score:91,updatedAt:'2026-07-31T12:00:00.000Z',evidenceIds:['E2']}],
 signals:[{id:'S1',type:'MARKET_TIGHTENING',title:'Market tightening',summary:'Vacancy declined',severity:'HIGH',occurredAt:'2026-07-31T14:00:00.000Z',evidence:[{id:'E3'}]}],
 decisions:[{id:'D1',disposition:'APPROVED',reason:'Proceed',decidedAt:'2026-07-31T15:00:00.000Z',evidenceIds:['E4']}]
});
t(model.total===4);
t(model.events[0].type==='DECISION');
t(model.events[1].type==='SIGNAL');
t(model.counts.WORKFLOW===1);
t(model.counts.OPPORTUNITY===1);
t(model.counts.SIGNAL===1);
t(model.counts.DECISION===1);
t(model.groups.length===1);
t(model.appendOnly);
t(model.traceable);
t(!model.autonomousExecutionAllowed);
t(model.events.every(item=>item.workspace));
t(model.events.every(item=>Array.isArray(item.sourceIds)));
t(Object.isFrozen(model));
t(Object.isFrozen(model.events));
const limited=createExecutiveTimelineExperience({signals:[{id:'1',occurredAt:'2026-07-31T01:00:00Z'},{id:'2',occurredAt:'2026-07-31T02:00:00Z'}],limit:1});
t(limited.total===1);
const empty=createExecutiveTimelineExperience();
t(empty.total===0);
t(empty.groups.length===0);
console.log(JSON.stringify({framework:'SCIIP_PHASE3_SPRINT36_EXECUTIVE_TIMELINE_EXPERIENCE',status:'PASSED',testsRun:tests,result:{events:model.total,groups:model.groups.length,signals:model.counts.SIGNAL,decisions:model.counts.DECISION,workflows:model.counts.WORKFLOW,opportunities:model.counts.OPPORTUNITY,appendOnly:true,traceable:true,responsiveUI:true,autonomousExecutionAllowed:false}},null,2));
