function sciipRun13130_ShardRangeReadIntentProcessor() {
  var cfg = {
    processorNumber: 13130,
    processorName: 'ShardRangeReadIntent',
    component: 'Shard Read Adapter Execution',
    backendLayer: 'Shard Read Adapter',
    sourceSheet: 'SHARD_LOOKUP_INTENT',
    targetSheet: 'SHARD_RANGE_READ_INTENT',
    statusField: 'shardRangeReadIntentStatus',
    nextAction: 'Run 13140_ShardReadCachePolicyProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13130_ShardRangeReadIntentProcessor() {
  var result = sciipRun13130_ShardRangeReadIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13130_ShardRangeReadIntentProcessor', result: result }));
  return result;
}
