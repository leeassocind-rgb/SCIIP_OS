import{freezeDeep}from'./_shared.js';
import{createExecutiveGovernanceProposalReviewDecision}from'./executiveGovernanceProposalReviewDecision.js';
import{evaluateExecutiveGovernanceProposalReviewPolicy}from'./executiveGovernanceProposalReviewPolicy.js';
import{createExecutiveGovernanceOrchestrationSubmission}from'./executiveGovernanceOrchestrationSubmission.js';
import{createExecutiveGovernanceProposalReviewLedger}from'./executiveGovernanceProposalReviewLedger.js';
import{createExecutiveGovernanceProposalReviewScorecard}from'./executiveGovernanceProposalReviewScorecard.js';

export function createExecutiveGovernanceProposalReviewEngine({maxEntries=100}={}){
  const ledger=createExecutiveGovernanceProposalReviewLedger({maxEntries});
  let started=true;
  return Object.freeze({
    review(input={}){
      if(!started)throw new Error('Governance proposal review engine is stopped');
      if(!input.id)throw new Error('Proposal review id is required');
      if(!input.bridgeResult?.proposal?.id)throw new Error('Bridge result is required');
      const existing=ledger.get(input.id)||ledger.getByProposal(input.bridgeResult.proposal.id);
      if(existing)return{duplicate:true,review:existing};
      const decision=createExecutiveGovernanceProposalReviewDecision(input.decision);
      if(decision.proposalId!==input.bridgeResult.proposal.id){
        throw new Error('Proposal review decision mismatch');
      }
      const policy=evaluateExecutiveGovernanceProposalReviewPolicy({
        bridgeResult:input.bridgeResult,
        decision
      });
      const submission=policy.orchestrationSubmissionAllowed
        ?createExecutiveGovernanceOrchestrationSubmission({
          id:`SUBMIT:${input.id}`,
          bridgeResult:input.bridgeResult,
          decision,
          policy
        })
        :null;
      const scorecard=createExecutiveGovernanceProposalReviewScorecard({
        id:`SCORECARD:${input.id}`,
        bridgeResult:input.bridgeResult,
        decision,
        policy,
        submission
      });
      const review=freezeDeep({
        id:String(input.id),
        proposalId:input.bridgeResult.proposal.id,
        bridgeResultId:input.bridgeResult.id,
        createdAt:input.createdAt||new Date().toISOString(),
        decision,
        policy,
        submission,
        scorecard,
        status:submission?'SUBMITTED_TO_EXISTING_ORCHESTRATOR':
          decision.disposition==='REJECTED'?'PROPOSAL_REJECTED':'PROPOSAL_DEFERRED'
      });
      const appended=ledger.append(review);
      return{duplicate:false,review:appended.entry};
    },
    getReviews:()=>ledger.list(),
    getStatus:()=>freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      reviews:ledger.list().length,
      appendOnly:true,
      humanApprovalRequired:true,
      executionAuthorized:false,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }),
    stop(){started=false},
    start(){started=true}
  });
}
