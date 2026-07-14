/**
 * SCIIP_OS v6.1 Repository Consolidation
 * Renumbered from 13830 to 108230 to preserve one-processor-number-per-processor.
 */
function sciipRun108230_BackendStorageCapacityTestProcessor() {
  var cfg = {
    processorNumber: 108230,
    processorName: 'BackendStorageCapacityTest',
    component: 'Backend Storage Acceptance',
    backendLayer: 'Backend Acceptance',
    sourceSheet: 'BACKEND_STORAGE_SMOKE_TEST',
    targetSheet: 'BACKEND_STORAGE_CAPACITY_TEST',
    statusField: 'backendStorageCapacityTestStatus',
    nextAction: 'Run 108240_BackendStorageRouteTestProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest108230_BackendStorageCapacityTestProcessor() {
  var result = sciipRun108230_BackendStorageCapacityTestProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest108230_BackendStorageCapacityTestProcessor', result: result }));
  return result;
}
