/**
 * SCIIP_OS v6.0 — 12830_DistributedRuntimeCapacityTestProcessor
 */
function sciipRun12830_DistributedRuntimeCapacityTestProcessor() {
  var cfg = {
    processorNumber: 12830,
    processorName: 'DistributedRuntimeCapacityTest',
    component: 'Distributed Runtime Acceptance',
    sourceSheet: 'DISTRIBUTED_RUNTIME_SMOKE_TEST',
    targetSheet: 'DISTRIBUTED_RUNTIME_CAPACITY_TEST',
    statusField: 'distributedRuntimeCapacityTestStatus',
    nextAction: 'Run 12840_DistributedRuntimeRouteTestProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12830_DistributedRuntimeCapacityTestProcessor() {
  var result = sciipRun12830_DistributedRuntimeCapacityTestProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12830_DistributedRuntimeCapacityTestProcessor', result: result }));
  return result;
}
