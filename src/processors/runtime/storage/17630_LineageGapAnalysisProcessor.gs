/**
 * SCIIP_OS v6.0 — 17630 LineageGapAnalysis
 */
function sciipRun17630_LineageGapAnalysisProcessor() {
  return SCIIP_STORAGE_LINEAGE_BACKEND.executeLineagePlan({
    processorNumber: 17630,
    processorName: 'LineageGapAnalysis',
    statusField: 'lineageGapAnalysisStatus',
    component: 'Storage Lineage Execution',
    backendLayer: 'Storage Lineage',
    sourceSheet: 'LINEAGE_COVERAGE_ASSESSMENT',
    targetSheet: 'LINEAGE_GAP_ANALYSIS',
    nextAction: 'Run 17640_LineagePlanningProcessor after this processor completes.'
  });
}

function sciipTest17630_LineageGapAnalysisProcessor() {
  var result = sciipRun17630_LineageGapAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17630_LineageGapAnalysisProcessor',
    result: result
  }));
  return result;
}
