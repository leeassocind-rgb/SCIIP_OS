function sciipRun13720_ShardFailoverPlanProcessor() {
  var cfg = {
    processorNumber: 13720,
    processorName: 'ShardFailoverPlan',
    component: 'Storage Failover Execution',
    backendLayer: 'Storage Failover',
    sourceSheet: 'FAILOVER_POLICY_REGISTRY',
    targetSheet: 'SHARD_FAILOVER_PLAN',
    statusField: 'shardFailoverPlanStatus',
    nextAction: 'Run 13730_LedgerFailoverPlanProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13720_ShardFailoverPlanProcessor() {
  var result = sciipRun13720_ShardFailoverPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13720_ShardFailoverPlanProcessor', result: result }));
  return result;
}
