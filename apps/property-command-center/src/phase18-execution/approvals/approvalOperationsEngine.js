const freeze=v=>Object.freeze(v);

export function operateApprovalQueue({requests=[],decisions=[]}={}) {
  const decisionMap=new Map(decisions.map(d=>[d.requestId,d]));
  const queue=requests.map(request=>{
    const decision=decisionMap.get(request.requestId);
    const status=decision?.status||'PENDING';
    return freeze({
      ...request,
      status,
      decidedBy:decision?.decidedBy||null,
      decidedAt:decision?.decidedAt||null,
      immutableDecisionRecord:Boolean(decision),
      executionAllowed:status==='APPROVED'
    });
  });

  return freeze({
    requests:freeze(queue),
    total:queue.length,
    approved:queue.filter(r=>r.status==='APPROVED').length,
    rejected:queue.filter(r=>r.status==='REJECTED').length,
    pending:queue.filter(r=>r.status==='PENDING').length,
    auditTrailPreserved:true,
    autonomousApprovalAllowed:false
  });
}
