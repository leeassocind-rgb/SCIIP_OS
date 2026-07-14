function sciipRun13660_StorageObservabilityGovernanceProcessor() {
  var cfg = {
    processorNumber: 13660,
    processorName: 'StorageObservabilityGovernance',
    component: 'Storage Observability Execution',
    backendLayer: 'Storage Observability',
    sourceSheet: 'ARCHIVE_METRIC_SIGNAL',
    targetSheet: 'STORAGE_OBSERVABILITY_GOVERNANCE',
    statusField: 'storageObservabilityGovernanceStatus',
    nextAction: 'Run 13670_StorageObservabilityValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13660_StorageObservabilityGovernanceProcessor() {
  var result = sciipRun13660_StorageObservabilityGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13660_StorageObservabilityGovernanceProcessor', result: result }));
  return result;
}
