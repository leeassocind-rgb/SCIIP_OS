/**
 * SCIIP_OS v6.0 — 14430_WorkbookSelectionProcessor
 */
function sciipRun14430_WorkbookSelectionProcessor() {
  var cfg = {
    processorNumber: 14430,
    processorName: 'WorkbookSelection',
    component: 'Storage Allocation Execution',
    backendLayer: 'Storage Allocation',
    sourceSheet: 'CAPACITY_ALLOCATION',
    targetSheet: 'WORKBOOK_SELECTION',
    statusField: 'workbookSelectionStatus',
    nextAction: 'Run 14440_DatasetPlacementProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ALLOCATION_BACKEND.executeAllocationPlan(cfg);
}

function sciipTest14430_WorkbookSelectionProcessor() {
  var result = sciipRun14430_WorkbookSelectionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14430_WorkbookSelectionProcessor', result: result }));
  return result;
}
