function sciipRun13850_BackendStorageRecoveryTestProcessor() {
  var cfg = {
    processorNumber: 13850,
    processorName: 'BackendStorageRecoveryTest',
    component: 'Backend Storage Acceptance',
    backendLayer: 'Backend Acceptance',
    sourceSheet: 'BACKEND_STORAGE_ROUTE_TEST',
    targetSheet: 'BACKEND_STORAGE_RECOVERY_TEST',
    statusField: 'backendStorageRecoveryTestStatus',
    nextAction: 'Run 13860_BackendStorageGovernanceProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13850_BackendStorageRecoveryTestProcessor() {
  var result = sciipRun13850_BackendStorageRecoveryTestProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13850_BackendStorageRecoveryTestProcessor', result: result }));
  return result;
}
