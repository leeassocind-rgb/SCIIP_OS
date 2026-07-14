/**
 * SCIIP_OS v6.0 — 17150 SearchExecution
 */
function sciipRun17150_SearchExecutionProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17150,
    processorName: 'SearchExecution',
    statusField: 'searchExecutionStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'SEARCH_PLANNING',
    targetSheet: 'SEARCH_EXECUTION',
    nextAction: 'Run 17160_SearchLedgerProcessor after this processor completes.'
  });
}

function sciipTest17150_SearchExecutionProcessor() {
  var result = sciipRun17150_SearchExecutionProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17150_SearchExecutionProcessor',
    result: result
  }));
  return result;
}
