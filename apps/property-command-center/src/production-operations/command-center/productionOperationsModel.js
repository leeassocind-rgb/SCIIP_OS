const freeze=value=>Object.freeze(value);

export function createProductionOperationsModel({
  runtime={},
  ingestion={},
  knowledgeGraph={},
  aiServices={},
  search={},
  eventPipeline={},
  storage={},
  approvals={}
}={}) {
  const serviceStates=[
    ['Runtime',runtime.status||'UNKNOWN'],
    ['Ingestion',ingestion.status||'UNKNOWN'],
    ['Knowledge Graph',knowledgeGraph.status||'UNKNOWN'],
    ['AI Services',aiServices.status||'UNKNOWN'],
    ['Search',search.status||'UNKNOWN'],
    ['Event Pipeline',eventPipeline.status||'UNKNOWN'],
    ['Storage',storage.status||'UNKNOWN']
  ].map(([name,status])=>freeze({name,status}));

  const unhealthy=serviceStates.filter(item=>!['OPERATIONAL','HEALTHY','READY','SYNCHRONIZED'].includes(item.status));
  const queueDepth=Number(ingestion.queueDepth||eventPipeline.queueDepth||0);
  const pendingApprovals=Number(approvals.pending||0);

  return freeze({
    health:unhealthy.length?'WATCH':'OPERATIONAL',
    services:freeze(serviceStates),
    servicesOperational:serviceStates.length-unhealthy.length,
    servicesTotal:serviceStates.length,
    ingestionThroughputPerMinute:Number(ingestion.throughputPerMinute||0),
    queueDepth,
    knowledgeGraphNodes:Number(knowledgeGraph.nodes||0),
    aiRequestsPerMinute:Number(aiServices.requestsPerMinute||0),
    searchLatencyMs:Number(search.latencyMs||0),
    eventLagMs:Number(eventPipeline.lagMs||0),
    storageUtilizationPct:Number(storage.utilizationPct||0),
    pendingApprovals,
    operationalControls:'READ_ONLY',
    productionWritesGoverned:true,
    autonomousExecutionAllowed:false
  });
}
