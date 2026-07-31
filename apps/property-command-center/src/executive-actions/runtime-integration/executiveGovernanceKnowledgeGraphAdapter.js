import{freezeDeep,uniq}from'./_shared.js';

export function createExecutiveGovernanceGraphProjection({signal,submission}={}){
  return freezeDeep({
    entities:[
      {id:signal.proposalId,type:'ExecutiveActionProposal'},
      {id:signal.submissionId,type:'GovernanceOrchestrationSubmission'},
      {id:signal.recommendationId,type:'ExecutiveRecommendation'},
      {id:signal.decisionId,type:'ExecutiveGovernanceDecision'}
    ].filter(item=>item.id),
    relationships:[
      {id:`REL:${signal.submissionId}:PROPOSAL`,from:signal.submissionId,to:signal.proposalId,type:'SUBMITS_PROPOSAL'},
      {id:`REL:${signal.proposalId}:RECOMMENDATION`,from:signal.proposalId,to:signal.recommendationId,type:'DERIVED_FROM_RECOMMENDATION'},
      {id:`REL:${signal.proposalId}:DECISION`,from:signal.proposalId,to:signal.decisionId,type:'AUTHORIZED_BY_DECISION'}
    ].filter(item=>item.from&&item.to),
    evidenceIds:uniq(submission.evidenceIds),
    sourceSignalIds:uniq(submission.sourceSignalIds),
    appendOnly:true
  });
}

export function projectExecutiveGovernanceKnowledgeGraph({knowledgeGraph,projection}={}){
  if(!knowledgeGraph)return freezeDeep({projected:false,projection,reason:'KNOWLEDGE_GRAPH_NOT_CONNECTED'});
  const fn=knowledgeGraph.project||knowledgeGraph.appendProjection||knowledgeGraph.ingest||knowledgeGraph.upsertGraph;
  if(typeof fn!=='function')return freezeDeep({projected:false,projection,reason:'KNOWLEDGE_GRAPH_API_UNSUPPORTED'});
  const result=fn.call(knowledgeGraph,projection);
  return freezeDeep({projected:true,projection,result:result??null});
}
