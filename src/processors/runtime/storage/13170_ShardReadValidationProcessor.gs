function sciipRun13170_ShardReadValidationProcessor() {
  var cfg = {
    processorNumber: 13170,
    processorName: 'ShardReadValidation',
    component: 'Shard Read Adapter Execution',
    backendLayer: 'Shard Read Adapter',
    sourceSheet: 'SHARD_READ_GOVERNANCE',
    targetSheet: 'SHARD_READ_VALIDATIONS',
    statusField: 'shardReadValidationStatus',
    nextAction: 'Run 13180_ShardReadCertificationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13170_ShardReadValidationProcessor() {
  var result = sciipRun13170_ShardReadValidationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13170_ShardReadValidationProcessor', result: result }));
  return result;
}
