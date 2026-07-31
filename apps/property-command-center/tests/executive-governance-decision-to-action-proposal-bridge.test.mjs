import assert from'node:assert/strict';
import{
  createExecutiveGovernanceDecisionActionBridge,
  createExecutiveGovernanceApprovedDecision,
  mapExecutiveGovernanceDecisionToActionProposal,
  evaluateExecutiveGovernanceProposalPolicy,
  createExecutiveGovernanceActionBridgeLedger
}from'../src/executive-actions/governance-action-bridge/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const ledgerEntry={
  id:'LEDGER:DEC-1',
  advisoryId:'ADV-21-2',
  recommendationId:'REC-1',
  sequence:1,
  status:'RECORDED',
  decision:{
    id:'DEC-1',
    advisoryId:'ADV-21-2',
    recommendationId:'REC-1',
    actorId:'EXEC-1',
    actorRole:'EXECUTIVE_REVIEWER',
    disposition:'APPROVED',
    reason:'Proceed to governed proposal preparation.',
    decidedAt:'2026-07-31T20:30:00.000Z',
    evidenceIds:['EV-1'],
    sourceSignalIds:['SIG-22']
  },
  policy:{passed:true,status:'REVIEW_POLICY_PASSED'}
};

const recommendation={
  id:'REC-1',
  action:'REVALIDATE_POLICY',
  title:'Revalidate governance policy',
  rationale:'Policy version drift detected.',
  priorityScore:68,
  confidence:68,
  subjectId:'INITIATIVE-1',
  certificationId:'CERT-19-1',
  evidenceIds:['EV-2'],
  sourceSignalIds:['SIG-21'],
  humanApprovalRequired:true
};

const bridge=createExecutiveGovernanceDecisionActionBridge({maxEntries:2});
t(bridge.getStatus().status==='OPERATIONAL');
t(bridge.getStatus().appendOnly);
t(bridge.getStatus().humanApprovalRequired);
t(!bridge.getStatus().directDispatchAllowed);
t(!bridge.getStatus().workflowMutationAllowed);
t(!bridge.getStatus().autonomousExecutionAllowed);

const output=bridge.bridge({
  id:'BRIDGE-23-1',
  ledgerEntry,
  recommendation
});
const r=output.result;
t(!output.duplicate);
t(r.id==='BRIDGE-23-1');
t(r.approvedDecisionId==='LEDGER:DEC-1');
t(r.recommendationId==='REC-1');
t(r.status==='READY_FOR_GOVERNED_PROPOSAL_REVIEW');
t(r.approvedDecision.humanApproved);
t(r.approvedDecision.actorId==='EXEC-1');
t(r.approvedDecision.decisionLedgerSequence===1);
t(r.proposal.id==='GOV-PROP:LEDGER:DEC-1');
t(r.proposal.proposalType==='GOVERNANCE_POLICY_REVALIDATION');
t(r.proposal.status==='PENDING_ACTION_PROPOSAL_REVIEW');
t(r.proposal.priorityScore===68);
t(r.proposal.confidence===68);
t(r.proposal.evidenceIds.includes('EV-1'));
t(r.proposal.evidenceIds.includes('EV-2'));
t(r.proposal.sourceSignalIds.includes('SIG-21'));
t(r.proposal.sourceSignalIds.includes('SIG-22'));
t(r.proposal.humanApprovalRequired);
t(!r.proposal.dispatchAllowed);
t(!r.proposal.workflowMutationAllowed);
t(!r.proposal.autonomousExecutionAllowed);
t(r.policy.passed);
t(r.policy.status==='PROPOSAL_POLICY_PASSED');
t(r.envelope.targetCapability==='executive-action-orchestration');
t(r.envelope.handoffStatus==='READY_FOR_GOVERNED_PROPOSAL_REVIEW');
t(r.envelope.humanApprovalRequired);
t(!r.envelope.directDispatchAllowed);
t(!r.envelope.workflowMutationAllowed);
t(!r.envelope.autonomousExecutionAllowed);
t(!r.directDispatchAllowed);
t(!r.workflowMutationAllowed);
t(!r.autonomousExecutionAllowed);
t(Object.isFrozen(r));
t(Object.isFrozen(r.proposal));
t(Object.isFrozen(r.envelope));
t(bridge.getResults().length===1);
t(bridge.getResults()[0].sequence===1);

const dup=bridge.bridge({id:'BRIDGE-23-1',ledgerEntry,recommendation});
t(dup.duplicate);
t(dup.result===r);

const approved=createExecutiveGovernanceApprovedDecision(ledgerEntry);
t(approved.humanApproved);
const proposal=mapExecutiveGovernanceDecisionToActionProposal({approvedDecision:approved,recommendation});
t(proposal.proposalType==='GOVERNANCE_POLICY_REVALIDATION');
const policy=evaluateExecutiveGovernanceProposalPolicy({approvedDecision:approved,recommendation,proposal});
t(policy.passed);

let rejectedBlocked=false;
try{
  createExecutiveGovernanceApprovedDecision({
    ...ledgerEntry,
    id:'LEDGER:DEC-R',
    decision:{...ledgerEntry.decision,disposition:'REJECTED'}
  });
}catch{rejectedBlocked=true}
t(rejectedBlocked);

let unrecordedBlocked=false;
try{
  createExecutiveGovernanceApprovedDecision({...ledgerEntry,id:'LEDGER:DEC-U',status:'BLOCKED'});
}catch{unrecordedBlocked=true}
t(unrecordedBlocked);

let policyBlocked=false;
try{
  createExecutiveGovernanceApprovedDecision({...ledgerEntry,id:'LEDGER:DEC-P',policy:{passed:false}});
}catch{policyBlocked=true}
t(policyBlocked);

const bridgeLedger=createExecutiveGovernanceActionBridgeLedger({maxEntries:1});
t(!bridgeLedger.append({id:'L1',approvedDecisionId:'D1'}).duplicate);
t(bridgeLedger.append({id:'L1',approvedDecisionId:'D1'}).duplicate);
t(bridgeLedger.append({id:'L2',approvedDecisionId:'D1'}).duplicate);
t(!bridgeLedger.append({id:'L3',approvedDecisionId:'D3'}).duplicate);
t(bridgeLedger.list().length===1);
t(bridgeLedger.list()[0].id==='L3');
t(bridgeLedger.getStatus().appendOnly);
t(!bridgeLedger.getStatus().directDispatchAllowed);

bridge.stop();
t(bridge.getStatus().status==='STOPPED');
let stopped=false;
try{bridge.bridge({id:'STOP',ledgerEntry,recommendation})}catch{stopped=true}
t(stopped);
bridge.start();
t(bridge.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT23_EXECUTIVE_GOVERNANCE_DECISION_TO_ACTION_PROPOSAL_BRIDGE',
  status:'PASSED',
  testsRun:tests,
  result:{
    bridgedDecisions:bridge.getResults().length,
    proposalType:r.proposal.proposalType,
    proposalStatus:r.proposal.status,
    handoffStatus:r.envelope.handoffStatus,
    humanApprovalRequired:true,
    directDispatchAllowed:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
