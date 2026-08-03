const freeze=v=>Object.freeze(v);

export function evaluateLargeScaleIngestionRehearsal({
  batches=[],
  objectives={minRowsPerSecond:100,maxErrorPct:1,maxQueueDepth:100}
}={}) {
  const rows=batches.map(batch=>{
    const durationSeconds=Math.max(.001,Number(batch.durationMs||0)/1000);
    const rowsPerSecond=Number((Number(batch.rows||0)/durationSeconds).toFixed(2));
    const errorPct=Number((Number(batch.errorRows||0)/Math.max(1,Number(batch.rows||0))*100).toFixed(2));
    const passed=
      rowsPerSecond>=objectives.minRowsPerSecond &&
      errorPct<=objectives.maxErrorPct &&
      Number(batch.maxQueueDepth||0)<=objectives.maxQueueDepth;
    return freeze({
      ...batch,
      rowsPerSecond,
      errorPct,
      passed,
      status:passed?'REHEARSAL_PASSED':'REHEARSAL_FAILED'
    });
  });

  return freeze({
    batches:freeze(rows),
    total:rows.length,
    passed:rows.filter(r=>r.passed).length,
    failed:rows.filter(r=>!r.passed).length,
    totalRows:rows.reduce((sum,r)=>sum+Number(r.rows||0),0),
    objectives:freeze({...objectives}),
    rehearsalCertified:rows.length>0&&rows.every(r=>r.passed),
    productionWritesAllowed:false
  });
}
