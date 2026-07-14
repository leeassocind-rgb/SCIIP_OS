/**
 * SCIIP_OS v6.0 — 14460_AllocationLedgerProcessor
 */
function sciipRun14460_AllocationLedgerProcessor() {
  var cfg = {
    processorNumber: 14460,
    processorName: 'AllocationLedger',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'SHARD_ASSIGNMENT',
    targetSheet: 'ALLOCATION_LEDGER',
    statusField: 'allocationLedgerStatus',
    nextAction: 'Run 14470_AllocationValidationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14460_AllocationLedgerProcessor() {
  var result = sciipRun14460_AllocationLedgerProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14460_AllocationLedgerProcessor', result: result }));
  return result;
}
