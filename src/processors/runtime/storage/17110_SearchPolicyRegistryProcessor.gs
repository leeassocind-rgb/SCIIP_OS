/**
 * SCIIP_OS v6.0 — 17110 SearchPolicyRegistry
 */
function sciipRun17110_SearchPolicyRegistryProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17110,
    processorName: 'SearchPolicyRegistry',
    statusField: 'searchPolicyRegistryStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'STORAGE_SEARCH_READINESS',
    targetSheet: 'SEARCH_POLICY_REGISTRY',
    nextAction: 'Run 17120_SearchCoverageAssessmentProcessor after this processor completes.'
  });
}

function sciipTest17110_SearchPolicyRegistryProcessor() {
  var result = sciipRun17110_SearchPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17110_SearchPolicyRegistryProcessor',
    result: result
  }));
  return result;
}
