function sciipRun13620_ShardMetricSignalProcessor() {
  var cfg = {
    processorNumber: 13620,
    processorName: 'ShardMetricSignal',
    component: 'Storage Observability Execution',
    backendLayer: 'Storage Observability',
    sourceSheet: 'STORAGE_METRIC_REGISTRY',
    targetSheet: 'SHARD_METRIC_SIGNAL',
    statusField: 'shardMetricSignalStatus',
    nextAction: 'Run 13630_LedgerMetricSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13620_ShardMetricSignalProcessor() {
  var result = sciipRun13620_ShardMetricSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13620_ShardMetricSignalProcessor', result: result }));
  return result;
}
