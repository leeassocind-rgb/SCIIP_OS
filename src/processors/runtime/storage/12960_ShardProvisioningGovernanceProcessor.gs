function sciipRun12960_ShardProvisioningGovernanceProcessor() {
  var cfg = {
    processorNumber: 12960,
    processorName: 'ShardProvisioningGovernance',
    component: 'Shard Provisioning Execution',
    backendLayer: 'Shard Provisioning',
    sourceSheet: 'SHARD_CAPACITY_BUDGET',
    targetSheet: 'SHARD_PROVISIONING_GOVERNANCE',
    statusField: 'shardProvisioningGovernanceStatus',
    nextAction: 'Run 12970_ShardProvisioningValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest12960_ShardProvisioningGovernanceProcessor() {
  var result = sciipRun12960_ShardProvisioningGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12960_ShardProvisioningGovernanceProcessor', result: result }));
  return result;
}
