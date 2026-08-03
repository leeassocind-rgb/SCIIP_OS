const freeze=v=>Object.freeze(v);

export function evaluateEnterpriseValue({initiatives=[],baselines={}}={}) {
  const results=initiatives.map(item=>{
    const baseline=Number(baselines[item.metric]||0);
    const current=Number(item.currentValue||0);
    const delta=Number((current-baseline).toFixed(2));
    const value=Number((delta*Number(item.unitValue||1)).toFixed(2));
    return freeze({
      ...item,
      baseline,
      delta,
      value,
      status:value>0?'VALUE_REALIZED':value===0?'NEUTRAL':'VALUE_AT_RISK',
      evidenceRequired:true
    });
  });
  return freeze({
    initiatives:freeze(results),
    total:results.length,
    realized:results.filter(i=>i.status==='VALUE_REALIZED').length,
    totalValue:Number(results.reduce((s,i)=>s+i.value,0).toFixed(2)),
    assumptionsVisible:true,
    evidenceBacked:true,
    autonomousFinancialClaimsAllowed:false
  });
}
