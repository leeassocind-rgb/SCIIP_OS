/**
 * SCIIP_OS v6.0 — 14400_StorageAllocationReadinessProcessor
 */
function sciipRun14400_StorageAllocationReadinessProcessor() {
  var cfg = {
    processorNumber: 14400,
    processorName: 'StorageAllocationReadiness',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'FEDERATION_ACCEPTANCES',
    targetSheet: 'STORAGE_ALLOCATION_READINESS',
    statusField: 'storageAllocationReadinessStatus',
    nextAction: 'Run 14410_AllocationPolicyRegistryProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14400_StorageAllocationReadinessProcessor() {
  var result = sciipRun14400_StorageAllocationReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14400_StorageAllocationReadinessProcessor', result: result }));
  return result;
}
