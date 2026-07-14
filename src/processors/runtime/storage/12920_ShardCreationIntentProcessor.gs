function sciipRun12920_ShardCreationIntentProcessor() {
  var cfg = {
    processorNumber: 12920,
    processorName: 'ShardCreationIntent',
    component: 'Shard Provisioning Execution',
    backendLayer: 'Shard Provisioning',
    sourceSheet: 'SHARD_TEMPLATE_REGISTRY',
    targetSheet: 'SHARD_CREATION_INTENT',
    statusField: 'shardCreationIntentStatus',
    nextAction: 'Run 12930_ShardNamingPolicyProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest12920_ShardCreationIntentProcessor() {
  var result = sciipRun12920_ShardCreationIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12920_ShardCreationIntentProcessor', result: result }));
  return result;
}
