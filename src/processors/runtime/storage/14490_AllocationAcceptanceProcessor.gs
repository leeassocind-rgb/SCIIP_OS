/**
 * SCIIP_OS v6.0 — 14490_AllocationAcceptanceProcessor
 */
function sciipRun14490_AllocationAcceptanceProcessor() {
  var cfg = {
    processorNumber: 14490,
    processorName: 'AllocationAcceptance',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'ALLOCATION_CERTIFICATIONS',
    targetSheet: 'ALLOCATION_ACCEPTANCES',
    statusField: 'allocationAcceptanceStatus',
    nextAction: 'Storage Allocation Execution accepted through 14490.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14490_AllocationAcceptanceProcessor() {
  var result = sciipRun14490_AllocationAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14490_AllocationAcceptanceProcessor', result: result }));
  return result;
}
