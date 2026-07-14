function sciipRun20530_AccessAnomalyAnalysisProcessor() {
  return SCIIP_STORAGE_ACCESS_PATTERN_BACKEND.executeAccessPatternPlan({
    processorNumber: 20530,
    processorName: 'AccessAnomalyAnalysis',
    statusField: 'accessAnomalyAnalysisStatus',
    component: 'Storage Access Pattern Execution',
    backendLayer: 'Storage Access Pattern',
    sourceSheet: 'ACCESS_PATTERN_ASSESSMENT',
    targetSheet: 'ACCESS_ANOMALY_ANALYSIS',
    nextAction: 'Run 20540_AccessPatternPlanningProcessor after this processor completes.'
  });
}

function sciipTest20530_AccessAnomalyAnalysisProcessor() {
  var result = sciipRun20530_AccessAnomalyAnalysisProcessor();
  console.log(JSON.stringify({test: 'sciipTest20530_AccessAnomalyAnalysisProcessor', result: result}));
  return result;
}
