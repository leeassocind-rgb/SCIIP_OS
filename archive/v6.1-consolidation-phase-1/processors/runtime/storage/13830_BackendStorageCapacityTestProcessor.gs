function sciipRun13830_BackendStorageCapacityTestProcessor() {
  var cfg = {
    processorNumber: 13830,
    processorName: 'BackendStorageCapacityTest',
    component: 'Backend Storage Acceptance',
    backendLayer: 'Backend Acceptance',
    sourceSheet: 'BACKEND_STORAGE_SMOKE_TEST',
    targetSheet: 'BACKEND_STORAGE_CAPACITY_TEST',
    statusField: 'backendStorageCapacityTestStatus',
    nextAction: 'Run 13840_BackendStorageRouteTestProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13830_BackendStorageCapacityTestProcessor() {
  var result = sciipRun13830_BackendStorageCapacityTestProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13830_BackendStorageCapacityTestProcessor', result: result }));
  return result;
}
