/**
 * SCIIP_OS v6.1 Repository Consolidation
 * Renumbered from 13840 to 108240 to preserve one-processor-number-per-processor.
 */
function sciipRun108240_BackendStorageRouteTestProcessor() {
  var cfg = {
    processorNumber: 108240,
    processorName: 'BackendStorageRouteTest',
    component: 'Backend Storage Acceptance',
    backendLayer: 'Backend Acceptance',
    sourceSheet: 'BACKEND_STORAGE_CAPACITY_TEST',
    targetSheet: 'BACKEND_STORAGE_ROUTE_TEST',
    statusField: 'backendStorageRouteTestStatus',
    nextAction: 'Run 108250_BackendStorageRecoveryTestProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest108240_BackendStorageRouteTestProcessor() {
  var result = sciipRun108240_BackendStorageRouteTestProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest108240_BackendStorageRouteTestProcessor', result: result }));
  return result;
}
