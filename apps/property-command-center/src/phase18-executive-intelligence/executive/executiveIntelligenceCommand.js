const freeze=v=>Object.freeze(v);

export function createExecutiveIntelligenceCommand({kpis={},objectives={},effectiveness={},recommendations={},approvals=[]}={}) {
  const attention=[
    ...(kpis.metrics||[]).filter(m=>m.status==='OFF_TARGET').map(m=>freeze({type:'KPI',id:m.metricId})),
    ...(objectives.objectives||[]).filter(o=>o.status==='AT_RISK').map(o=>freeze({type:'OBJECTIVE',id:o.objectiveId})),
    ...(effectiveness.decisions||[]).filter(d=>d.status==='REVIEW_REQUIRED'||d.status==='PENDING_OUTCOME').map(d=>freeze({type:'DECISION',id:d.decisionId})),
    ...(recommendations.recommendations||[]).filter(r=>r.status==='LOW_CONFIDENCE').map(r=>freeze({type:'RECOMMENDATION',id:r.recommendationId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    kpis:freeze({...kpis}),
    objectives:freeze({...objectives}),
    effectiveness:freeze({...effectiveness}),
    recommendations:freeze({...recommendations}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    executiveIntelligenceReady:true,
    executiveApprovalRequired:true,
    autonomousExecutionAllowed:false,
    autonomousObjectiveChangesAllowed:false
  });
}
