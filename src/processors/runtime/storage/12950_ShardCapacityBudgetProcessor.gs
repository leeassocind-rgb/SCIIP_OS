function sciipRun12950_ShardCapacityBudgetProcessor() {
  var cfg = {
    processorNumber: 12950,
    processorName: 'ShardCapacityBudget',
    component: 'Shard Provisioning Execution',
    backendLayer: 'Shard Provisioning',
    sourceSheet: 'SHARD_ACCESS_POLICY',
    targetSheet: 'SHARD_CAPACITY_BUDGET',
    statusField: 'shardCapacityBudgetStatus',
    nextAction: 'Run 12960_ShardProvisioningGovernanceProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest12950_ShardCapacityBudgetProcessor() {
  var result = sciipRun12950_ShardCapacityBudgetProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12950_ShardCapacityBudgetProcessor', result: result }));
  return result;
}
