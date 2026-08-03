const freeze=v=>Object.freeze(v);

export function createCorpusActivationCommand({activation={},identity={},synchronization={},graph={},approvals=[]}={}) {
  const attention=[
    ...(activation.datasets||[]).filter(d=>!d.eligible).map(d=>freeze({type:'DATASET_BLOCK',id:d.datasetId})),
    ...(identity.identities||[]).filter(i=>i.reviewRequired).map(i=>freeze({type:'IDENTITY_REVIEW',id:i.canonicalId})),
    ...(synchronization.events||[]).filter(e=>!e.linked).map(e=>freeze({type:'EVENT_IDENTITY',id:e.eventId})),
    ...(synchronization.relationships||[]).filter(r=>!r.synchronized).map(r=>freeze({type:'RELATIONSHIP_IDENTITY',id:r.relationshipId})),
    ...(graph.missingNodes||[]).map(n=>freeze({type:'GRAPH_NODE_MISSING',id:n.id})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    activation:freeze({...activation}),
    identity:freeze({...identity}),
    synchronization:freeze({...synchronization}),
    graph:freeze({...graph}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    corpusActivationReady:true,
    executiveApprovalRequired:true,
    autonomousActivationAllowed:false,
    autonomousGraphMutationAllowed:false
  });
}
