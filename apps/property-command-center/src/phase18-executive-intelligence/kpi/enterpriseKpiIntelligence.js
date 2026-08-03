const freeze=v=>Object.freeze(v);

export function evaluateEnterpriseKpis({metrics=[]}={}) {
  const rows=metrics.map(metric=>{
    const actual=Number(metric.actual||0);
    const target=Number(metric.target||0);
    const attainmentPct=target?Number((actual/target*100).toFixed(2)):0;
    const variance=Number((actual-target).toFixed(2));
    return freeze({
      ...metric,
      actual,
      target,
      attainmentPct,
      variance,
      status:attainmentPct>=100?'ON_TARGET':attainmentPct>=85?'WATCH':'OFF_TARGET',
      evidenceRequired:true
    });
  });

  return freeze({
    metrics:freeze(rows),
    total:rows.length,
    onTarget:rows.filter(r=>r.status==='ON_TARGET').length,
    watch:rows.filter(r=>r.status==='WATCH').length,
    offTarget:rows.filter(r=>r.status==='OFF_TARGET').length,
    assumptionsVisible:true,
    autonomousMetricChangesAllowed:false
  });
}
