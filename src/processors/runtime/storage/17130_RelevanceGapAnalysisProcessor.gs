/**
 * SCIIP_OS v6.0 — 17130 RelevanceGapAnalysis
 */
function sciipRun17130_RelevanceGapAnalysisProcessor() {
  return SCIIP_STORAGE_SEARCH_BACKEND.executeSearchPlan({
    processorNumber: 17130,
    processorName: 'RelevanceGapAnalysis',
    statusField: 'relevanceGapAnalysisStatus',
    component: 'Storage Search Execution',
    backendLayer: 'Storage Search',
    sourceSheet: 'SEARCH_COVERAGE_ASSESSMENT',
    targetSheet: 'RELEVANCE_GAP_ANALYSIS',
    nextAction: 'Run 17140_SearchPlanningProcessor after this processor completes.'
  });
}

function sciipTest17130_RelevanceGapAnalysisProcessor() {
  var result = sciipRun17130_RelevanceGapAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17130_RelevanceGapAnalysisProcessor',
    result: result
  }));
  return result;
}
