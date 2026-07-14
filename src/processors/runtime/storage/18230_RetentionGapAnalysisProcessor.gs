/**
 * SCIIP_OS v6.0 — 18230 RetentionGapAnalysis
 */
function sciipRun18230_RetentionGapAnalysisProcessor() {
  return SCIIP_STORAGE_RETENTION_BACKEND.executeRetentionPlan({
    processorNumber: 18230,
    processorName: 'RetentionGapAnalysis',
    statusField: 'retentionGapAnalysisStatus',
    component: 'Storage Retention Execution',
    backendLayer: 'Storage Retention',
    sourceSheet: 'RETENTION_COVERAGE_ASSESSMENT',
    targetSheet: 'RETENTION_GAP_ANALYSIS',
    nextAction: 'Run 18240_RetentionPlanningProcessor after this processor completes.'
  });
}

function sciipTest18230_RetentionGapAnalysisProcessor() {
  var result = sciipRun18230_RetentionGapAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18230_RetentionGapAnalysisProcessor',
    result: result
  }));
  return result;
}
