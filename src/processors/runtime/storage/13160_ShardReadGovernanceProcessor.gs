function sciipRun13160_ShardReadGovernanceProcessor() {
  var cfg = {
    processorNumber: 13160,
    processorName: 'ShardReadGovernance',
    component: 'Shard Read Adapter Execution',
    backendLayer: 'Shard Read Adapter',
    sourceSheet: 'SHARD_READ_FAILURE_POLICY',
    targetSheet: 'SHARD_READ_GOVERNANCE',
    statusField: 'shardReadGovernanceStatus',
    nextAction: 'Run 13170_ShardReadValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13160_ShardReadGovernanceProcessor() {
  var result = sciipRun13160_ShardReadGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13160_ShardReadGovernanceProcessor', result: result }));
  return result;
}
