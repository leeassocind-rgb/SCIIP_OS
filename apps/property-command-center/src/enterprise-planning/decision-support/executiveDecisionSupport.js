const freeze = value => Object.freeze(value);

export function buildExecutiveDecisionSupport({decisions=[],evidence=[]}={}) {
  const evidenceMap = new Map();
  for (const item of evidence) {
    if (!evidenceMap.has(item.decisionId)) evidenceMap.set(item.decisionId, []);
    evidenceMap.get(item.decisionId).push(item);
  }

  const ranked = decisions.map(decision => {
    const linked = evidenceMap.get(decision.decisionId) || [];
    const reward = Number(decision.rewardScore || 0);
    const risk = Number(decision.riskScore || 0);
    const confidence = linked.length
      ? Number((linked.reduce((sum,item)=>sum+Number(item.confidence||0),0)/linked.length).toFixed(3))
      : 0;
    const score = Number((reward - risk + confidence * 20).toFixed(2));

    return freeze({
      ...decision,
      score,
      confidence,
      evidenceCount:linked.length,
      status:linked.length?'READY_FOR_EXECUTIVE_REVIEW':'INSUFFICIENT_EVIDENCE',
      approvalRequired:true,
      autoExecute:false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    decisions:freeze(ranked),
    total:ranked.length,
    topDecision:ranked[0]||null,
    evidenceChainPreserved:true,
    permanentHistory:true,
    approvalRequired:true,
    autonomousExecutionAllowed:false
  });
}
