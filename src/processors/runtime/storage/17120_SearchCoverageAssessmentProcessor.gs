/**
 * SCIIP_OS v6.0 — 17120 SearchCoverageAssessment
 */
function sciipRun17120_SearchCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17120,
    processorName: 'SearchCoverageAssessment',
    statusField: 'searchCoverageAssessmentStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'SEARCH_POLICY_REGISTRY',
    targetSheet: 'SEARCH_COVERAGE_ASSESSMENT',
    nextAction: 'Run 17130_RelevanceGapAnalysisProcessor after this processor completes.'
  });
}

function sciipTest17120_SearchCoverageAssessmentProcessor() {
  var result = sciipRun17120_SearchCoverageAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17120_SearchCoverageAssessmentProcessor',
    result: result
  }));
  return result;
}
