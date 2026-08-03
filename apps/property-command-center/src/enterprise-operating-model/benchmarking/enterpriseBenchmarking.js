const freeze=v=>Object.freeze(v);

export function evaluateEnterpriseBenchmarks({metrics=[],benchmarks=[]}={}) {
  const benchmarkMap=new Map(benchmarks.map(b=>[b.metricId,b]));
  const rows=metrics.map(metric=>{
    const benchmark=benchmarkMap.get(metric.metricId);
    const actual=Number(metric.actual||0);
    const target=Number(benchmark?.target||0);
    const direction=benchmark?.direction||'HIGHER_IS_BETTER';
    const variance=Number((actual-target).toFixed(2));
    const favorable=direction==='LOWER_IS_BETTER'?actual<=target:actual>=target;
    return freeze({
      ...metric,
      target,
      variance,
      favorable,
      status:favorable?'AT_OR_ABOVE_BENCHMARK':'BELOW_BENCHMARK'
    });
  });

  return freeze({
    metrics:freeze(rows),
    total:rows.length,
    favorable:rows.filter(m=>m.favorable).length,
    belowBenchmark:rows.filter(m=>!m.favorable).length,
    assumptionsVisible:true,
    evidenceBacked:true,
    autonomousTargetChangesAllowed:false
  });
}
