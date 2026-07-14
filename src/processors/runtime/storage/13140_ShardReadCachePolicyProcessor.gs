function sciipRun13140_ShardReadCachePolicyProcessor() {
  var cfg = {
    processorNumber: 13140,
    processorName: 'ShardReadCachePolicy',
    component: 'Shard Read Adapter Execution',
    backendLayer: 'Shard Read Adapter',
    sourceSheet: 'SHARD_RANGE_READ_INTENT',
    targetSheet: 'SHARD_READ_CACHE_POLICY',
    statusField: 'shardReadCachePolicyStatus',
    nextAction: 'Run 13150_ShardReadFailurePolicyProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13140_ShardReadCachePolicyProcessor() {
  var result = sciipRun13140_ShardReadCachePolicyProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13140_ShardReadCachePolicyProcessor', result: result }));
  return result;
}
