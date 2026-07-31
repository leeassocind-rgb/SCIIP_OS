import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceRuntimeProjection({signal,submission}={}){
  return freezeDeep({
    id:`RUNTIME:${submission.id}`,
    workspace:'Executive',
    capability:'executive-governance-runtime-integration',
    proposalId:submission.proposalId,
    submissionId:submission.id,
    signalId:signal.id,
    status:'AWAITING_EXISTING_ORCHESTRATOR_PROCESSING',
    priorityScore:signal.priorityScore,
    confidence:signal.confidence,
    humanApprovalRecorded:true,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

export function projectExecutiveGovernanceRuntime({executiveRuntime,projection}={}){
  if(!executiveRuntime)return freezeDeep({projected:false,projection,reason:'EXECUTIVE_RUNTIME_NOT_CONNECTED'});
  const fn=executiveRuntime.project||executiveRuntime.upsert||executiveRuntime.registerState||executiveRuntime.set;
  if(typeof fn!=='function')return freezeDeep({projected:false,projection,reason:'EXECUTIVE_RUNTIME_API_UNSUPPORTED'});
  const result=fn.call(executiveRuntime,projection.id,projection);
  return freezeDeep({projected:true,projection,result:result??null});
}
