const freeze=v=>Object.freeze(v);

export function allocateStrategicCapital({initiatives=[],capitalLimit=0}={}) {
  const ranked=initiatives.map(item=>{
    const value=Number(item.valueScore||0);
    const confidence=Number(item.confidence||0);
    const risk=Number(item.riskScore||0);
    const cost=Number(item.cost||0);
    const score=Number((value*.45+confidence*25-risk*.20).toFixed(2));
    return freeze({...item,cost,score});
  }).sort((a,b)=>b.score-a.score);

  let used=0;
  const rows=ranked.map(item=>{
    const selected=used+item.cost<=capitalLimit;
    if(selected) used+=item.cost;
    return freeze({
      ...item,
      selected,
      status:selected?'ALLOCATED':'DEFERRED',
      approvalRequired:true
    });
  });

  return freeze({
    initiatives:freeze(rows),
    total:rows.length,
    allocated:rows.filter(r=>r.selected).length,
    deferred:rows.filter(r=>!r.selected).length,
    capitalLimit:Number(capitalLimit),
    capitalAllocated:Number(used.toFixed(2)),
    capitalRemaining:Number((capitalLimit-used).toFixed(2)),
    assumptionsVisible:true,
    autonomousAllocationAllowed:false
  });
}
