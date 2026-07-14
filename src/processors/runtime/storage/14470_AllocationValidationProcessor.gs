/**
 * SCIIP_OS v6.0 — 14470_AllocationValidationProcessor
 */
function sciipRun14470_AllocationValidationProcessor() {
  var cfg = {
    processorNumber: 14470,
    processorName: 'AllocationValidation',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'ALLOCATION_LEDGER',
    targetSheet: 'ALLOCATION_VALIDATIONS',
    statusField: 'allocationValidationStatus',
    nextAction: 'Run 14480_AllocationCertificationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14470_AllocationValidationProcessor() {
  var result = sciipRun14470_AllocationValidationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14470_AllocationValidationProcessor', result: result }));
  return result;
}
