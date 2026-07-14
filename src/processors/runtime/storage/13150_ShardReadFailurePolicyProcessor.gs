function sciipRun13150_ShardReadFailurePolicyProcessor() {
  var cfg = {
    processorNumber: 13150,
    processorName: 'ShardReadFailurePolicy',
    component: 'Shard Read Adapter Execution',
    backendLayer: 'Shard Read Adapter',
    sourceSheet: 'SHARD_READ_CACHE_POLICY',
    targetSheet: 'SHARD_READ_FAILURE_POLICY',
    statusField: 'shardReadFailurePolicyStatus',
    nextAction: 'Run 13160_ShardReadGovernanceProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13150_ShardReadFailurePolicyProcessor() {
  var result = sciipRun13150_ShardReadFailurePolicyProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13150_ShardReadFailurePolicyProcessor', result: result }));
  return result;
}
