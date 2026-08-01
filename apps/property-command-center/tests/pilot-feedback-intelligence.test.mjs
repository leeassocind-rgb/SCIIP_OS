import assert from'node:assert/strict';
import{analyzePilotFeedback}from'../src/pilot-operations/feedback/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=analyzePilotFeedback({responses:[
  {responseId:'F1',workspace:'GIS Intelligence',category:'USABILITY',sentiment:-1,evidence:[{}]},
  {responseId:'F2',workspace:'GIS Intelligence',category:'USABILITY',sentiment:-0.5,evidence:[{},{}]},
  {responseId:'F3',workspace:'Executive Mission Control',category:'VALUE',sentiment:1,evidence:[{}]}
]});

t(result.totalResponses===3);
t(result.actionableResponses===3);
t(result.themes.length===2);
t(result.highPriorityThemes===1);
t(result.themes[0].workspace==='GIS Intelligence');
t(result.themes[0].priority==='HIGH');
t(result.themes[0].recommendedAction==='REVIEW_AND_REMEDIATE');
t(result.evidenceBacked);
t(result.humanReviewRequired);
t(!result.changesAutoApplied);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT133_PILOT_FEEDBACK_INTELLIGENCE',
  status:'PASSED',testsRun:n,result
},null,2));
