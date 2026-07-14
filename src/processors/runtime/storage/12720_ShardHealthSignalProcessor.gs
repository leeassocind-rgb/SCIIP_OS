/**
 * SCIIP_OS v6.0 — 12720_ShardHealthSignalProcessor
 */
function sciipRun12720_ShardHealthSignalProcessor() {
  var cfg = {
    processorNumber: 12720,
    processorName: 'ShardHealthSignal',
    component: 'Cluster Health Monitor',
    sourceSheet: 'CLUSTER_CAPACITY_SIGNAL',
    targetSheet: 'SHARD_HEALTH_SIGNAL',
    statusField: 'shardHealthSignalStatus',
    nextAction: 'Run 12730_LedgerHealthSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12720_ShardHealthSignalProcessor() {
  var result = sciipRun12720_ShardHealthSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12720_ShardHealthSignalProcessor', result: result }));
  return result;
}
