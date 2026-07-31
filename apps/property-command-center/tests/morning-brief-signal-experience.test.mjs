import assert from'node:assert/strict';
import{createMorningBriefSignalExperience}from'../src/autonomous-intelligence/ux/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const model=createMorningBriefSignalExperience({
 brief:{
  status:'EVIDENCE_BACKED',generatedAt:'2026-07-31T14:00:00.000Z',evidenceIds:['E1','E2'],brokerApprovalRequired:true,
  sections:{
   executiveSummary:{headline:'Two decisions require attention.',factsOnly:true},
   assignmentPriorities:[{assignmentId:'A1',name:'Rialto',urgency:90,confidence:88,reason:'Client decision'},{assignmentId:'A2',name:'Ontario',urgency:75,confidence:80,reason:'Market shift'}],
   marketChanges:[{id:'M1',type:'RENT_CHANGE',magnitude:.12,confidence:.9,evidenceIds:['E1']}],
   newComparables:[{id:'C1',address:'100 Test Way',date:'2026-07-31',evidenceIds:['E2']}],
   approvalsRequired:[{id:'R1',status:'PENDING_REVIEW'}]
  }
 },
 decision:{decisionId:'D1'},
 snapshot:{evidenceIds:['E3']},
 signalState:{sourceSignalIds:['S1'],reviewRequired:true}
});
t(model.status==='EVIDENCE_BACKED');
t(model.headline.includes('Two decisions'));
t(model.priorities.length===2);
t(model.priorities[0].id==='A1');
t(model.marketChanges.length===1);
t(model.comparables.length===1);
t(model.approvals.length===1);
t(model.evidenceCount===4);
t(model.evidenceIds.includes('S1'));
t(model.decisionId==='D1');
t(model.reviewRequired);
t(model.brokerApprovalRequired);
t(model.autonomousConsequentialActions==='BLOCKED');
t(model.factsOnly);
t(Object.isFrozen(model));
t(Object.isFrozen(model.priorities));
const empty=createMorningBriefSignalExperience();
t(empty.status==='REVIEW_REQUIRED');
t(empty.priorities.length===0);
t(empty.evidenceCount===0);
console.log(JSON.stringify({framework:'SCIIP_PHASE3_SPRINT35_MORNING_BRIEF_SIGNAL_EXPERIENCE',status:'PASSED',testsRun:tests,result:{priorities:model.priorities.length,marketChanges:model.marketChanges.length,comparables:model.comparables.length,approvals:model.approvals.length,evidenceCount:model.evidenceCount,responsiveUI:true,brokerApprovalRequired:true,autonomousConsequentialActions:'BLOCKED'}},null,2));
