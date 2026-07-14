/**
 * SCIIP_OS v6.0 — 14450_ShardAssignmentProcessor
 */
function sciipRun14450_ShardAssignmentProcessor() {
  var cfg = {
    processorNumber: 14450,
    processorName: 'ShardAssignment',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'DATASET_PLACEMENT',
    targetSheet: 'SHARD_ASSIGNMENT',
    statusField: 'shardAssignmentStatus',
    nextAction: 'Run 14460_AllocationLedgerProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14450_ShardAssignmentProcessor() {
  var result = sciipRun14450_ShardAssignmentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14450_ShardAssignmentProcessor', result: result }));
  return result;
}
