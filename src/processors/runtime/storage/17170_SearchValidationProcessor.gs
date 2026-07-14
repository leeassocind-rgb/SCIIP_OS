/**
 * SCIIP_OS v6.0 — 17170 SearchValidation
 */
function sciipRun17170_SearchValidationProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17170,
    processorName: 'SearchValidation',
    statusField: 'searchValidationStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'SEARCH_LEDGER',
    targetSheet: 'SEARCH_VALIDATIONS',
    nextAction: 'Run 17180_SearchCertificationProcessor after this processor completes.'
  });
}

function sciipTest17170_SearchValidationProcessor() {
  var result = sciipRun17170_SearchValidationProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17170_SearchValidationProcessor',
    result: result
  }));
  return result;
}
