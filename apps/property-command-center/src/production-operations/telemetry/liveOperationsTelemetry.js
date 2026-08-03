const freeze=value=>Object.freeze(value);

export function aggregateLiveOperationsTelemetry({
  samples=[],
  thresholds={
    queueDepth:100,
    apiLatencyMs:500,
    memoryUtilizationPct:85,
    storageUtilizationPct:85,
    eventLagMs:1000
  }
}={}) {
  const latest=samples[samples.length-1]||{};
  const avg=(field)=>{
    const values=samples.map(item=>Number(item[field]||0));
    return values.length?Number((values.reduce((sum,value)=>sum+value,0)/values.length).toFixed(2)):0;
  };

  const metrics=freeze({
    queueDepth:Number(latest.queueDepth||0),
    processingLatencyMs:Number(latest.processingLatencyMs||0),
    workerUtilizationPct:Number(latest.workerUtilizationPct||0),
    memoryUtilizationPct:Number(latest.memoryUtilizationPct||0),
    cacheHitRatePct:Number(latest.cacheHitRatePct||0),
    storageUtilizationPct:Number(latest.storageUtilizationPct||0),
    apiLatencyMs:Number(latest.apiLatencyMs||0),
    eventLagMs:Number(latest.eventLagMs||0),
    ingestionThroughputPerMinute:Number(latest.ingestionThroughputPerMinute||0)
  });

  const alerts=[];
  if(metrics.queueDepth>thresholds.queueDepth)alerts.push('QUEUE_DEPTH');
  if(metrics.apiLatencyMs>thresholds.apiLatencyMs)alerts.push('API_LATENCY');
  if(metrics.memoryUtilizationPct>thresholds.memoryUtilizationPct)alerts.push('MEMORY');
  if(metrics.storageUtilizationPct>thresholds.storageUtilizationPct)alerts.push('STORAGE');
  if(metrics.eventLagMs>thresholds.eventLagMs)alerts.push('EVENT_LAG');

  return freeze({
    metrics,
    trends:freeze({
      averageQueueDepth:avg('queueDepth'),
      averageApiLatencyMs:avg('apiLatencyMs'),
      averageMemoryUtilizationPct:avg('memoryUtilizationPct'),
      averageEventLagMs:avg('eventLagMs'),
      averageIngestionThroughputPerMinute:avg('ingestionThroughputPerMinute')
    }),
    samples:samples.length,
    alerts:freeze(alerts),
    alertCount:alerts.length,
    status:alerts.length?'WATCH':'OPERATIONAL',
    realTime:true,
    historicalTrends:true,
    productionWritesGoverned:true,
    autonomousExecutionAllowed:false
  });
}
