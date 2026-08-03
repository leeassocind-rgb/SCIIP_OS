const freeze=v=>Object.freeze(v);

export function buildGovernedActionPlan({recommendations=[],constraints=[]}={}) {
  const blockedIds=new Set(constraints.filter(c=>c.status==='BLOCKED').map(c=>c.recommendationId));
  const actions=recommendations.map((r,index)=>freeze({
    actionId:`ACT-${String(index+1).padStart(4,'0')}`,
    recommendationId:r.recommendationId,
    label:r.label,
    priority:Number(r.priority||0),
    blocked:blockedIds.has(r.recommendationId),
    approvalRequired:true,
    autoExecute:false,
    status:blockedIds.has(r.recommendationId)?'BLOCKED':'PLANNED'
  })).sort((a,b)=>b.priority-a.priority);

  return freeze({
    actions:freeze(actions),
    total:actions.length,
    planned:actions.filter(a=>a.status==='PLANNED').length,
    blocked:actions.filter(a=>a.status==='BLOCKED').length,
    approvalRequired:true,
    permanentHistory:true,
    autonomousExecutionAllowed:false
  });
}
