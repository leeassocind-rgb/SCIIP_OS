import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceInsight({signal,projection}={}){
  return freezeDeep({
    id:`INSIGHT:${signal.id}`,
    type:'GOVERNANCE_ACTION_PROPOSAL',
    title:'Governed action proposal submitted',
    summary:`Proposal ${signal.proposalId} is awaiting existing orchestrator processing.`,
    subjectId:signal.subjectId,
    priorityScore:signal.priorityScore,
    confidence:signal.confidence,
    signalId:signal.id,
    runtimeProjectionId:projection.id,
    reviewRequired:true,
    readOnly:true,
    executionAuthorized:false
  });
}

export function exposeExecutiveGovernanceInsight({executiveInsight,insight}={}){
  if(!executiveInsight)return freezeDeep({exposed:false,insight,reason:'EXECUTIVE_INSIGHT_NOT_CONNECTED'});
  const fn=executiveInsight.ingest||executiveInsight.addInsight||executiveInsight.publish||executiveInsight.register;
  if(typeof fn!=='function')return freezeDeep({exposed:false,insight,reason:'EXECUTIVE_INSIGHT_API_UNSUPPORTED'});
  const result=fn.call(executiveInsight,insight);
  return freezeDeep({exposed:true,insight,result:result??null});
}
