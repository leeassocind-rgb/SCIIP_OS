import assert from'node:assert/strict';
import{governLearningCandidates}from'../src/phase18-outcomes/learning/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=governLearningCandidates({
 candidates:[
  {candidateId:'C1',evidenceCount:3,minimumEvidence:2},
  {candidateId:'C2',evidenceCount:1,minimumEvidence:2}
 ],
 approvals:[{candidateId:'C1',status:'APPROVED'}]
});
t(r.total===2);t(r.approved===1);t(r.blocked===1);
t(r.candidates[0].status==='APPROVED_FOR_CONTROLLED_UPDATE');
t(r.approvalRequired);t(r.rollbackRequired);t(!r.autonomousLearningAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT316_CONTROLLED_LEARNING_GOVERNANCE',status:'PASSED',testsRun:n,result:r},null,2));
