function sciipRun13860_BackendStorageGovernanceProcessor() {
  var cfg = {
    processorNumber: 13860,
    processorName: 'BackendStorageGovernance',
    component: 'Backend Storage Acceptance',
    backendLayer: 'Backend Acceptance',
    sourceSheet: 'BACKEND_STORAGE_RECOVERY_TEST',
    targetSheet: 'BACKEND_STORAGE_GOVERNANCE',
    statusField: 'backendStorageGovernanceStatus',
    nextAction: 'Run 13870_BackendStorageValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13860_BackendStorageGovernanceProcessor() {
  var result = sciipRun13860_BackendStorageGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13860_BackendStorageGovernanceProcessor', result: result }));
  return result;
}
