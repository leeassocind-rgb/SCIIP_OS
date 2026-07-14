/**
 * SCIIP_OS v6.0 — 28830 StoragePlatformKnowledgeManagementRiskAnalysis
 */
function sciipRun28830_StoragePlatformKnowledgeManagementRiskAnalysisProcessor() {
  return SCIIP_STORAGE_PLATFORM_KNOWLEDGE_MANAGEMENT_BACKEND.executePlatformKnowledgeManagementPlan({
    processorNumber: 28830,
    processorName: 'StoragePlatformKnowledgeManagementRiskAnalysis',
    statusField: 'storagePlatformKnowledgeManagementRiskAnalysisStatus',
    component: 'Storage Platform Knowledge Management Execution',
    backendLayer: 'Storage Platform Knowledge Management',
    sourceSheet: 'STORAGE_PLATFORM_KNOWLEDGE_MANAGEMENT_COVERAGE_ASSESSMENT',
    targetSheet: 'STORAGE_PLATFORM_KNOWLEDGE_MANAGEMENT_RISK_ANALYSIS',
    nextAction: 'Run 28840_StoragePlatformKnowledgeManagementPlanningProcessor after this processor completes.'
  });
}

function sciipTest28830_StoragePlatformKnowledgeManagementRiskAnalysisProcessor() {
  var result = sciipRun28830_StoragePlatformKnowledgeManagementRiskAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest28830_StoragePlatformKnowledgeManagementRiskAnalysisProcessor',
    result: result
  }));
  return result;
}
