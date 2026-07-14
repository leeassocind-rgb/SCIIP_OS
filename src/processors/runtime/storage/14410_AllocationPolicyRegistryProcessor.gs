/**
 * SCIIP_OS v6.0 — 14410_AllocationPolicyRegistryProcessor
 */
function sciipRun14410_AllocationPolicyRegistryProcessor() {
  var cfg = {
    processorNumber: 14410,
    processorName: 'AllocationPolicyRegistry',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'STORAGE_ALLOCATION_READINESS',
    targetSheet: 'ALLOCATION_POLICY_REGISTRY',
    statusField: 'allocationPolicyRegistryStatus',
    nextAction: 'Run 14420_CapacityAllocationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14410_AllocationPolicyRegistryProcessor() {
  var result = sciipRun14410_AllocationPolicyRegistryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14410_AllocationPolicyRegistryProcessor', result: result }));
  return result;
}
