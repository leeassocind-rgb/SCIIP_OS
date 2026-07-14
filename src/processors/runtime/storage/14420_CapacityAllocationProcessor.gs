/**
 * SCIIP_OS v6.0 — 14420_CapacityAllocationProcessor
 */
function sciipRun14420_CapacityAllocationProcessor() {
  var cfg = {
    processorNumber: 14420,
    processorName: 'CapacityAllocation',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'ALLOCATION_POLICY_REGISTRY',
    targetSheet: 'CAPACITY_ALLOCATION',
    statusField: 'capacityAllocationStatus',
    nextAction: 'Run 14430_WorkbookSelectionProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14420_CapacityAllocationProcessor() {
  var result = sciipRun14420_CapacityAllocationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14420_CapacityAllocationProcessor', result: result }));
  return result;
}
