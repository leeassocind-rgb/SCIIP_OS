import{freezeDeep,uniq}from'./_shared.js';

export function createExecutiveGovernanceWorkflowHandoff({submission,signal}={}){
  return freezeDeep({
    id:`WORKFLOW-HANDOFF:${submission.id}`,
    target:'existing-workflow-engine',
    proposalId:submission.proposalId,
    submissionId:submission.id,
    signalId:signal.id,
    workflowType:submission.payload?.proposalType||'GOVERNANCE_REVIEW_ACTION',
    status:'READY_FOR_EXISTING_WORKFLOW_ENGINE_INTAKE',
    evidenceIds:uniq(submission.evidenceIds),
    sourceSignalIds:uniq(submission.sourceSignalIds),
    humanApprovalRecorded:true,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

export function submitExecutiveGovernanceWorkflowHandoff({workflowEngine,handoff}={}){
  if(!workflowEngine)return freezeDeep({submitted:false,handoff,reason:'WORKFLOW_ENGINE_NOT_CONNECTED'});
  const fn=workflowEngine.submitProposal||workflowEngine.acceptHandoff||workflowEngine.enqueueProposal||workflowEngine.submit;
  if(typeof fn!=='function')return freezeDeep({submitted:false,handoff,reason:'WORKFLOW_ENGINE_API_UNSUPPORTED'});
  const result=fn.call(workflowEngine,handoff);
  return freezeDeep({submitted:true,handoff,result:result??null});
}
