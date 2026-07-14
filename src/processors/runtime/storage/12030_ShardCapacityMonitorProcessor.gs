/**
 * SCIIP_OS v6.0 — 12030_ShardCapacityMonitorProcessor
 */
function sciipRun12030_ShardCapacityMonitorProcessor() {
  var cfg = {
    processorNumber: 12030,
    processorName: 'ShardCapacityMonitor',
    component: 'Workbook Sharding Engine',
    sourceSheet: 'SHARD_ALLOCATION_POLICY',
    targetSheet: 'SHARD_CAPACITY_MONITOR',
    statusField: 'shardCapacityMonitorStatus',
    nextAction: 'Run 12040_ShardRolloverPlannerProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12030_ShardCapacityMonitorProcessor() {
  var result = sciipRun12030_ShardCapacityMonitorProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12030_ShardCapacityMonitorProcessor', result: result }));
  return result;
}
