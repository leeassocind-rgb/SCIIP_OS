/**
 * SCIIP_OS v6.0 — 14440_DatasetPlacementProcessor
 */
function sciipRun14440_DatasetPlacementProcessor() {
  var cfg = {
    processorNumber: 14440,
    processorName: 'DatasetPlacement',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'WORKBOOK_SELECTION',
    targetSheet: 'DATASET_PLACEMENT',
    statusField: 'datasetPlacementStatus',
    nextAction: 'Run 14450_ShardAssignmentProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14440_DatasetPlacementProcessor() {
  var result = sciipRun14440_DatasetPlacementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14440_DatasetPlacementProcessor', result: result }));
  return result;
}
