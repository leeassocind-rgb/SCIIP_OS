function sciipRun13020_ShardAppendIntentProcessor() {
  var cfg = {
    processorNumber: 13020,
    processorName: 'ShardAppendIntent',
    component: 'Shard Write Adapter Execution',
    backendLayer: 'Shard Write Adapter',
    sourceSheet: 'SHARD_WRITE_CONTRACT',
    targetSheet: 'SHARD_APPEND_INTENT',
    statusField: 'shardAppendIntentStatus',
    nextAction: 'Run 13030_ShardBatchWriteIntentProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13020_ShardAppendIntentProcessor() {
  var result = sciipRun13020_ShardAppendIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13020_ShardAppendIntentProcessor', result: result }));
  return result;
}
