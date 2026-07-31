import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceCommandCenterState({signal,projection,insight}={}){
  return freezeDeep({
    id:`COMMAND-CENTER:${signal.submissionId}`,
    section:'Governance Actions',
    proposalId:signal.proposalId,
    submissionId:signal.submissionId,
    signalId:signal.id,
    projectionId:projection.id,
    insightId:insight.id,
    status:'AWAITING_EXISTING_ORCHESTRATOR_PROCESSING',
    humanApprovalRecorded:true,
    reviewRequired:true,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

export function updateExecutiveGovernanceCommandCenter({commandCenter,state}={}){
  if(!commandCenter)return freezeDeep({updated:false,state,reason:'COMMAND_CENTER_NOT_CONNECTED'});
  const fn=commandCenter.updateSection||commandCenter.upsert||commandCenter.publishState||commandCenter.set;
  if(typeof fn!=='function')return freezeDeep({updated:false,state,reason:'COMMAND_CENTER_API_UNSUPPORTED'});
  const result=fn.call(commandCenter,state.section,state);
  return freezeDeep({updated:true,state,result:result??null});
}
