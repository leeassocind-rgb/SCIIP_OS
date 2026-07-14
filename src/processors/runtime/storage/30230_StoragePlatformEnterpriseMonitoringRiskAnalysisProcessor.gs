/**
 * SCIIP_OS v6.0 — 30230 StoragePlatformEnterpriseMonitoringRiskAnalysis
 */
function sciipRun30230_StoragePlatformEnterpriseMonitoringRiskAnalysisProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_MONITORING_BACKEND.executePlatformEnterpriseMonitoringPlan({
    processorNumber: 30230,
    processorName: 'StoragePlatformEnterpriseMonitoringRiskAnalysis',
    statusField: 'storagePlatformEnterpriseMonitoringRiskAnalysisStatus',
    component: 'Storage Platform Enterprise Monitoring Execution',
    backendLayer: 'Storage Platform Enterprise Monitoring',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_MONITORING_COVERAGE_ASSESSMENT',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_MONITORING_RISK_ANALYSIS',
    nextAction: 'Run 30240_StoragePlatformEnterpriseMonitoringPlanningProcessor after this processor completes.'
  });
}

function sciipTest30230_StoragePlatformEnterpriseMonitoringRiskAnalysisProcessor() {
  var result = sciipRun30230_StoragePlatformEnterpriseMonitoringRiskAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest30230_StoragePlatformEnterpriseMonitoringRiskAnalysisProcessor',
    result: result
  }));
  return result;
}
