const freeze=v=>Object.freeze(v);

export function evaluateImprovementBacklog({items=[],evidence=[]}={}) {
  const ids=new Set(evidence.map(e=>e.evidenceId));
  const rows=items.map(item=>{
    const supported=(item.evidenceIds||[]).length>0&&(item.evidenceIds||[]).every(id=>ids.has(id));
    const impact=Number(item.impactScore||0),effort=Number(item.effortScore||0),risk=Number(item.riskScore||0);
    const priorityScore=Number((impact*1.4-effort*.6-risk*.4).toFixed(2));
    return freeze({
      ...item,
      supported,
      priorityScore,
      status:supported?'READY_FOR_REVIEW':'INSUFFICIENT_EVIDENCE',
      approvalRequired:true
    });
  }).sort((a,b)=>b.priorityScore-a.priorityScore);

  return freeze({
    items:freeze(rows),
    total:rows.length,
    supported:rows.filter(i=>i.supported).length,
    topImprovement:rows.find(i=>i.supported)||null,
    evidenceRequired:true,
    humanReviewRequired:true,
    autonomousProcessChangesAllowed:false
  });
}
