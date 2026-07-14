/**
 * SCIIP_OS v6.0 — 17160 SearchLedger
 */
function sciipRun17160_SearchLedgerProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17160,
    processorName: 'SearchLedger',
    statusField: 'searchLedgerStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'SEARCH_EXECUTION',
    targetSheet: 'SEARCH_LEDGER',
    nextAction: 'Run 17170_SearchValidationProcessor after this processor completes.'
  });
}

function sciipTest17160_SearchLedgerProcessor() {
  var result = sciipRun17160_SearchLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17160_SearchLedgerProcessor',
    result: result
  }));
  return result;
}
