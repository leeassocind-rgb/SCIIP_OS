/**
 * SCIIP_OS v6.0 — 17190 SearchAcceptance
 */
function sciipRun17190_SearchAcceptanceProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17190,
    processorName: 'SearchAcceptance',
    statusField: 'searchAcceptanceStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'SEARCH_CERTIFICATIONS',
    targetSheet: 'SEARCH_ACCEPTANCES',
    nextAction: 'Storage Search Execution accepted through 17190.'
  });
}

function sciipTest17190_SearchAcceptanceProcessor() {
  var result = sciipRun17190_SearchAcceptanceProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17190_SearchAcceptanceProcessor',
    result: result
  }));
  return result;
}
