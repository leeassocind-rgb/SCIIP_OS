const freeze=v=>Object.freeze(v);

export function buildDecisionGraph({decisions=[],evidence=[],dependencies=[]}={}) {
  const evidenceByDecision=new Map();
  for(const item of evidence){
    if(!evidenceByDecision.has(item.decisionId)) evidenceByDecision.set(item.decisionId,[]);
    evidenceByDecision.get(item.decisionId).push(item);
  }

  const nodes=decisions.map(decision=>{
    const linked=evidenceByDecision.get(decision.decisionId)||[];
    return freeze({
      ...decision,
      evidenceCount:linked.length,
      evidenceComplete:linked.length>=Number(decision.minimumEvidence||1),
      status:linked.length>=Number(decision.minimumEvidence||1)?'EVIDENCE_READY':'EVIDENCE_INCOMPLETE'
    });
  });

  const edges=dependencies.map(dep=>freeze({
    ...dep,
    fromExists:nodes.some(n=>n.decisionId===dep.fromDecisionId),
    toExists:nodes.some(n=>n.decisionId===dep.toDecisionId)
  }));

  return freeze({
    nodes:freeze(nodes),
    edges:freeze(edges),
    totalDecisions:nodes.length,
    evidenceReady:nodes.filter(n=>n.evidenceComplete).length,
    permanentDecisionHistory:true,
    evidenceRequired:true,
    autonomousDecisionAllowed:false
  });
}
