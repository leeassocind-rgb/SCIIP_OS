/**
 * SCIIP_OS v6.0 — 16130 SLOGapAnalysis
 */
function sciipRun16130_SLOGapAnalysisProcessor() {
  return SCIIP_STORAGE_SERVICE_LEVEL_BACKEND.executeServiceLevelPlan({
    processorNumber: 16130,
    processorName: 'SLOGapAnalysis',
    statusField: 'sloGapAnalysisStatus',
    component: 'Storage Service Level Execution',
    backendLayer: 'Storage Service Level',
    sourceSheet: 'SERVICE_LEVEL_ASSESSMENT',
    targetSheet: 'SLO_GAP_ANALYSIS',
    nextAction: 'Run 16140_ServiceLevelPlanningProcessor after this processor completes.'
  });
}

function sciipTest16130_SLOGapAnalysisProcessor() {
  var result = sciipRun16130_SLOGapAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest16130_SLOGapAnalysisProcessor',
    result: result
  }));
  return result;
}
