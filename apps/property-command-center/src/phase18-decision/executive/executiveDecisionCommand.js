const freeze=v=>Object.freeze(v);

export function createExecutiveDecisionCommand({graph={},evidence={},recommendations={},orchestration={},approvals=[]}={}) {
  const attention=[
    ...(graph.nodes||[]).filter(n=>!n.evidenceComplete).map(n=>freeze({type:'DECISION_EVIDENCE',id:n.decisionId})),
    ...(evidence.chains||[]).filter(c=>c.status==='UNSUPPORTED').map(c=>freeze({type:'UNSUPPORTED_CLAIM',id:c.claimId})),
    ...(recommendations.recommendations||[]).filter(r=>r.status==='LOW_CONFIDENCE').map(r=>freeze({type:'LOW_CONFIDENCE',id:r.recommendationId})),
    ...(orchestration.decisions||[]).filter(d=>d.status==='BLOCKED').map(d=>freeze({type:'ORCHESTRATION_BLOCK',id:d.decisionId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    graph:freeze({...graph}),
    evidence:freeze({...evidence}),
    recommendations:freeze({...recommendations}),
    orchestration:freeze({...orchestration}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    executiveDecisionCommandReady:true,
    humanApprovalRequired:true,
    autonomousDecisionAllowed:false,
    autonomousExecutionAllowed:false
  });
}
