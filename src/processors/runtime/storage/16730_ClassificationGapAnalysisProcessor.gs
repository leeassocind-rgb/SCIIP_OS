/**
 * SCIIP_OS v6.0 — 16730 ClassificationGapAnalysis
 */
function sciipRun16730_ClassificationGapAnalysisProcessor() {
  return SCIIP_STORAGE_CLASSIFICATION_BACKEND.executeClassificationPlan({
    processorNumber: 16730,
    processorName: 'ClassificationGapAnalysis',
    statusField: 'classificationGapAnalysisStatus',
    component: 'Storage Classification Execution',
    backendLayer: 'Storage Classification',
    sourceSheet: 'DATA_INVENTORY_ASSESSMENT',
    targetSheet: 'CLASSIFICATION_GAP_ANALYSIS',
    nextAction: 'Run 16740_ClassificationPlanningProcessor after this processor completes.'
  });
}

function sciipTest16730_ClassificationGapAnalysisProcessor() {
  var result = sciipRun16730_ClassificationGapAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest16730_ClassificationGapAnalysisProcessor',
    result: result
  }));
  return result;
}
