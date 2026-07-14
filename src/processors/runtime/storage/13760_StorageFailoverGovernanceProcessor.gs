function sciipRun13760_StorageFailoverGovernanceProcessor() {
  var cfg = {
    processorNumber: 13760,
    processorName: 'StorageFailoverGovernance',
    component: 'Storage Failover Execution',
    backendLayer: 'Storage Failover',
    sourceSheet: 'ARCHIVE_FAILOVER_PLAN',
    targetSheet: 'STORAGE_FAILOVER_GOVERNANCE',
    statusField: 'storageFailoverGovernanceStatus',
    nextAction: 'Run 13770_StorageFailoverValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13760_StorageFailoverGovernanceProcessor() {
  var result = sciipRun13760_StorageFailoverGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13760_StorageFailoverGovernanceProcessor', result: result }));
  return result;
}
