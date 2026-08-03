const freeze=v=>Object.freeze(v);

export function buildChangeEnablementPlan({audiences=[],training=[],communications=[],approvals=[]}={}) {
  const approved=new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.approvalId));
  const plans=audiences.map(audience=>{
    const sessions=training.filter(t=>t.audienceId===audience.audienceId);
    const messages=communications.filter(c=>c.audienceId===audience.audienceId);
    const blocked=[...sessions,...messages].filter(item=>item.approvalId&&!approved.has(item.approvalId)).length;
    return freeze({
      audienceId:audience.audienceId,
      trainingCount:sessions.length,
      communicationCount:messages.length,
      blocked,
      status:blocked?'BLOCKED':'READY'
    });
  });
  return freeze({
    plans:freeze(plans),
    total:plans.length,
    ready:plans.filter(p=>p.status==='READY').length,
    approvalAware:true,
    humanLedEnablement:true,
    autonomousCommunicationAllowed:false
  });
}
