import assert from'node:assert/strict';
import{
  createExecutiveGovernanceProposalReviewEngine,
  createExecutiveGovernanceProposalReviewDecision,
  evaluateExecutiveGovernanceProposalReviewPolicy,
  createExecutiveGovernanceOrchestrationSubmission,
  createExecutiveGovernanceProposalReviewLedger
}from'../src/executive-actions/governance-proposal-review/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const bridgeResult={
  id:'BRIDGE-23-1',
  status:'READY_FOR_GOVERNED_PROPOSAL_REVIEW',
  proposal:{
    id:'GOV-PROP:LEDGER:DEC-1',
    proposalType:'GOVERNANCE_POLICY_REVALIDATION',
    title:'Revalidate governance policy',
    description:'Policy drift detected.',
    priorityScore:68,
    confidence:68,
    subjectId:'INITIATIVE-1',
    certificationId:'CERT-19-1',
    recommendationId:'REC-1',
    decisionId:'LEDGER:DEC-1',
    evidenceIds:['EV-1','EV-2'],
    sourceSignalIds:['SIG-21','SIG-22'],
    dispatchAllowed:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  },
  envelope:{
    id:'ENV:BRIDGE-23-1',
    targetCapability:'executive-action-orchestration'
  }
};

const engine=createExecutiveGovernanceProposalReviewEngine({maxEntries:3});
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().appendOnly);
t(engine.getStatus().humanApprovalRequired);
t(!engine.getStatus().executionAuthorized);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const approved=engine.review({
  id:'REVIEW-24-1',
  bridgeResult,
  decision:{
    id:'PROP-DEC-1',
    proposalId:'GOV-PROP:LEDGER:DEC-1',
    envelopeId:'ENV:BRIDGE-23-1',
    actorId:'EXEC-2',
    actorRole:'ACTION_PROPOSAL_REVIEWER',
    disposition:'APPROVED',
    reason:'Submit to existing orchestrator for governed processing.',
    evidenceIds:['EV-APPROVAL'],
    sourceSignalIds:['SIG-24']
  }
}).review;
t(approved.id==='REVIEW-24-1');
t(approved.proposalId==='GOV-PROP:LEDGER:DEC-1');
t(approved.decision.disposition==='APPROVED');
t(approved.decision.humanDecision);
t(approved.policy.passed);
t(approved.policy.orchestrationSubmissionAllowed);
t(approved.submission!==null);
t(approved.submission.targetCapability==='executive-action-orchestration');
t(approved.submission.submissionStatus==='SUBMITTED_TO_EXISTING_ORCHESTRATOR');
t(approved.submission.submittedBy==='EXEC-2');
t(approved.submission.payload.proposalType==='GOVERNANCE_POLICY_REVALIDATION');
t(approved.submission.payload.priorityScore===68);
t(approved.submission.evidenceIds.includes('EV-1'));
t(approved.submission.evidenceIds.includes('EV-APPROVAL'));
t(approved.submission.sourceSignalIds.includes('SIG-24'));
t(approved.submission.humanApprovalRecorded);
t(!approved.submission.executionAuthorized);
t(!approved.submission.workflowMutationAllowed);
t(!approved.submission.autonomousExecutionAllowed);
t(approved.scorecard.orchestrationSubmitted);
t(approved.scorecard.submissionStatus==='SUBMITTED_TO_EXISTING_ORCHESTRATOR');
t(approved.scorecard.humanApprovalRecorded);
t(!approved.scorecard.executionAuthorized);
t(!approved.scorecard.workflowMutationAllowed);
t(!approved.scorecard.autonomousExecutionAllowed);
t(approved.scorecard.decisionTraceability);
t(approved.status==='SUBMITTED_TO_EXISTING_ORCHESTRATOR');
t(Object.isFrozen(approved));
t(Object.isFrozen(approved.submission));
t(Object.isFrozen(approved.scorecard));
t(engine.getReviews().length===1);
t(engine.getReviews()[0].sequence===1);

const duplicate=engine.review({
  id:'REVIEW-24-1',
  bridgeResult,
  decision:{
    id:'PROP-DEC-X',
    proposalId:'GOV-PROP:LEDGER:DEC-1',
    actorId:'EXEC-2',
    disposition:'APPROVED',
    reason:'Duplicate',
    evidenceIds:['EV']
  }
});
t(duplicate.duplicate);
t(duplicate.review===approved);

const rejectedBridge={
  ...bridgeResult,
  id:'BRIDGE-23-2',
  proposal:{...bridgeResult.proposal,id:'GOV-PROP:LEDGER:DEC-2'}
};
const rejected=engine.review({
  id:'REVIEW-24-2',
  bridgeResult:rejectedBridge,
  decision:{
    id:'PROP-DEC-2',
    proposalId:'GOV-PROP:LEDGER:DEC-2',
    actorId:'EXEC-3',
    disposition:'REJECTED',
    reason:'Insufficient strategic value.',
    evidenceIds:['EV-REJECT']
  }
}).review;
t(rejected.status==='PROPOSAL_REJECTED');
t(rejected.submission===null);
t(!rejected.policy.orchestrationSubmissionAllowed);
t(!rejected.scorecard.orchestrationSubmitted);

const deferredBridge={
  ...bridgeResult,
  id:'BRIDGE-23-3',
  proposal:{...bridgeResult.proposal,id:'GOV-PROP:LEDGER:DEC-3'}
};
const deferred=engine.review({
  id:'REVIEW-24-3',
  bridgeResult:deferredBridge,
  decision:{
    id:'PROP-DEC-3',
    proposalId:'GOV-PROP:LEDGER:DEC-3',
    actorId:'EXEC-4',
    disposition:'DEFERRED',
    reason:'Await additional evidence.',
    evidenceIds:['EV-DEFER']
  }
}).review;
t(deferred.status==='PROPOSAL_DEFERRED');
t(deferred.submission===null);
t(!deferred.scorecard.orchestrationSubmitted);
t(engine.getReviews().length===3);

const decision=createExecutiveGovernanceProposalReviewDecision({
  id:'D-DIRECT',
  proposalId:'P-DIRECT',
  actorId:'EXEC-5',
  disposition:'APPROVED',
  reason:'Approved.',
  evidenceIds:['EV-DIRECT']
});
t(decision.humanDecision);
const policy=evaluateExecutiveGovernanceProposalReviewPolicy({
  bridgeResult:{...bridgeResult,proposal:{...bridgeResult.proposal,id:'P-DIRECT'}},
  decision
});
t(policy.passed);
const submission=createExecutiveGovernanceOrchestrationSubmission({
  id:'S-DIRECT',
  bridgeResult:{...bridgeResult,proposal:{...bridgeResult.proposal,id:'P-DIRECT'}},
  decision,
  policy
});
t(submission.submissionStatus==='SUBMITTED_TO_EXISTING_ORCHESTRATOR');

const blockedDecision=createExecutiveGovernanceProposalReviewDecision({
  id:'D-BLOCK',
  proposalId:'P-BLOCK',
  actorId:'EXEC-6',
  disposition:'APPROVED',
  reason:'Missing evidence.'
});
const blockedPolicy=evaluateExecutiveGovernanceProposalReviewPolicy({
  bridgeResult:{...bridgeResult,proposal:{...bridgeResult.proposal,id:'P-BLOCK'}},
  decision:blockedDecision
});
t(!blockedPolicy.passed);
t(blockedPolicy.reasons.includes('APPROVAL_EVIDENCE_REQUIRED'));

const ledger=createExecutiveGovernanceProposalReviewLedger({maxEntries:1});
t(!ledger.append({id:'L1',proposalId:'P1'}).duplicate);
t(ledger.append({id:'L1',proposalId:'P1'}).duplicate);
t(ledger.append({id:'L2',proposalId:'P1'}).duplicate);
t(!ledger.append({id:'L3',proposalId:'P3'}).duplicate);
t(ledger.list().length===1);
t(ledger.list()[0].id==='L3');
t(ledger.getStatus().appendOnly);
t(!ledger.getStatus().executionAuthorized);

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stopped=false;
try{engine.review({id:'STOP',bridgeResult,decision:{}})}catch{stopped=true}
t(stopped);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT24_EXECUTIVE_GOVERNANCE_ACTION_PROPOSAL_REVIEW_ORCHESTRATION_SUBMISSION',
  status:'PASSED',
  testsRun:tests,
  result:{
    proposalReviews:engine.getReviews().length,
    approvedSubmissions:engine.getReviews().filter(item=>item.submission).length,
    rejectedProposals:engine.getReviews().filter(item=>item.status==='PROPOSAL_REJECTED').length,
    deferredProposals:engine.getReviews().filter(item=>item.status==='PROPOSAL_DEFERRED').length,
    submissionStatus:approved.submission.submissionStatus,
    humanApprovalRecorded:true,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
