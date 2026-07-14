function sciipRun13120_ShardLookupIntentProcessor() {
  var cfg = {
    processorNumber: 13120,
    processorName: 'ShardLookupIntent',
    component: 'Shard Read Adapter Execution',
    backendLayer: 'Shard Read Adapter',
    sourceSheet: 'SHARD_READ_CONTRACT',
    targetSheet: 'SHARD_LOOKUP_INTENT',
    statusField: 'shardLookupIntentStatus',
    nextAction: 'Run 13130_ShardRangeReadIntentProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13120_ShardLookupIntentProcessor() {
  var result = sciipRun13120_ShardLookupIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13120_ShardLookupIntentProcessor', result: result }));
  return result;
}
