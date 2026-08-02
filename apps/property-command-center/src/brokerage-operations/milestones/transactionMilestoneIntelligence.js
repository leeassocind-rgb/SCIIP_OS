const freeze=v=>Object.freeze(v);

export function evaluateTransactionMilestones({dealId,milestones=[],today=new Date().toISOString().slice(0,10)}={}) {
  if(!dealId) throw new Error('dealId is required');
  const now=new Date(today).getTime();

  const rows=milestones.map(milestone=>{
    const due=new Date(milestone.dueDate).getTime();
    const days=Math.ceil((due-now)/86400000);
    const overdue=days<0&&milestone.status!=='COMPLETED';
    const atRisk=!overdue&&days<=7&&milestone.status!=='COMPLETED';
    return freeze({
      ...milestone,
      daysRemaining:days,
      overdue,
      atRisk,
      health:overdue?'OVERDUE':atRisk?'AT_RISK':milestone.status==='COMPLETED'?'COMPLETE':'ON_TRACK'
    });
  });

  return freeze({
    dealId,
    milestones:freeze(rows),
    total:rows.length,
    overdue:rows.filter(item=>item.overdue).length,
    atRisk:rows.filter(item=>item.atRisk).length,
    evidenceBacked:true,
    brokerReviewRequired:true,
    autonomousDeadlineChangesAllowed:false
  });
}
