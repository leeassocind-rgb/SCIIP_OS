/**
 * SCIIP_OS v6.0 — 12710_ClusterCapacitySignalProcessor
 */
function sciipRun12710_ClusterCapacitySignalProcessor() {
  var cfg = {
    processorNumber: 12710,
    processorName: 'ClusterCapacitySignal',
    component: 'Cluster Health Monitor',
    sourceSheet: 'CLUSTER_HEALTH_READINESS',
    targetSheet: 'CLUSTER_CAPACITY_SIGNAL',
    statusField: 'clusterCapacitySignalStatus',
    nextAction: 'Run 12720_ShardHealthSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12710_ClusterCapacitySignalProcessor() {
  var result = sciipRun12710_ClusterCapacitySignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12710_ClusterCapacitySignalProcessor', result: result }));
  return result;
}
