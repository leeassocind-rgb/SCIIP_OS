import assert from'node:assert/strict';
import{createGovernedImprovementProposals}from'../src/pilot-operations/improvements/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=createGovernedImprovementProposals({
  feedbackThemes:[{
    priority:'HIGH',workspace:'GIS Intelligence',category:'USABILITY',
    responseCount:2,evidenceCount:3,recommendedAction:'REVIEW_AND_REMEDIATE'
  }],
  adoptionAnalytics:{workspaces:[{
    workspace:'GIS Intelligence',failureRate:.5,interactions:2
  }]},
  issues:[{
    severity:'CRITICAL',status:'OPEN',category:'UX',evidenceCount:2
  }]
});
t(result.total===3);
t(result.highImpact===1);
t(result.proposals[0].status==='PROPOSED');
t(result.proposals.every(item=>item.approvalRequired));
t(result.proposals.every(item=>!item.changesAutoApplied));
t(result.approvalRequired);
t(!result.changesAutoApplied);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT136_GOVERNED_IMPROVEMENT_PROPOSALS',
  status:'PASSED',testsRun:n,result
},null,2));
