function sciipRun13840_BackendStorageRouteTestProcessor() {
  var cfg = {
    processorNumber: 13840,
    processorName: 'BackendStorageRouteTest',
    component: 'Backend Storage Acceptance',
    backendLayer: 'Backend Acceptance',
    sourceSheet: 'BACKEND_STORAGE_CAPACITY_TEST',
    targetSheet: 'BACKEND_STORAGE_ROUTE_TEST',
    statusField: 'backendStorageRouteTestStatus',
    nextAction: 'Run 13850_BackendStorageRecoveryTestProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13840_BackendStorageRouteTestProcessor() {
  var result = sciipRun13840_BackendStorageRouteTestProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13840_BackendStorageRouteTestProcessor', result: result }));
  return result;
}
