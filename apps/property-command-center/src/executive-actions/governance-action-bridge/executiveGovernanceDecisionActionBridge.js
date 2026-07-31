import{freezeDeep}from'./_shared.js';
import{createExecutiveGovernanceApprovedDecision}from'./executiveGovernanceApprovedDecision.js';
import{mapExecutiveGovernanceDecisionToActionProposal}from'./executiveGovernanceActionProposalMapper.js';
import{evaluateExecutiveGovernanceProposalPolicy}from'./executiveGovernanceProposalPolicy.js';
import{createExecutiveGovernanceProposalEnvelope}from'./executiveGovernanceProposalEnvelope.js';
import{createExecutiveGovernanceActionBridgeLedger}from'./executiveGovernanceActionBridgeLedger.js';

export function createExecutiveGovernanceDecisionActionBridge({maxEntries=100}={}){
  const ledger=createExecutiveGovernanceActionBridgeLedger({maxEntries});
  let started=true;
  return Object.freeze({
    bridge(input={}){
      if(!started)throw new Error('Governance decision action bridge is stopped');
      if(!input.id)throw new Error('Bridge operation id is required');
      const existing=ledger.get(input.id);
      if(existing)return{duplicate:true,result:existing};
      const approvedDecision=createExecutiveGovernanceApprovedDecision(input.ledgerEntry);
      const proposal=mapExecutiveGovernanceDecisionToActionProposal({
        approvedDecision,
        recommendation:input.recommendation
      });
      const policy=evaluateExecutiveGovernanceProposalPolicy({
        approvedDecision,
        recommendation:input.recommendation,
        proposal
      });
      if(!policy.passed)throw new Error(`Proposal policy blocked: ${policy.reasons.join(',')}`);
      const envelope=createExecutiveGovernanceProposalEnvelope({
        id:`ENV:${input.id}`,
        proposal,
        policy
      });
      const result=freezeDeep({
        id:String(input.id),
        approvedDecisionId:approvedDecision.id,
        recommendationId:approvedDecision.recommendationId,
        approvedDecision,
        proposal,
        policy,
        envelope,
        status:'READY_FOR_GOVERNED_PROPOSAL_REVIEW',
        directDispatchAllowed:false,
        workflowMutationAllowed:false,
        autonomousExecutionAllowed:false
      });
      const appended=ledger.append(result);
      return{duplicate:false,result:appended.entry};
    },
    getResults:()=>ledger.list(),
    getStatus:()=>freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      bridgedDecisions:ledger.list().length,
      appendOnly:true,
      humanApprovalRequired:true,
      directDispatchAllowed:false,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }),
    stop(){started=false},
    start(){started=true}
  });
}
