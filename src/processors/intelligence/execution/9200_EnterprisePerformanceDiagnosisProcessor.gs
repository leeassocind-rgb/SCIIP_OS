/**
 * SCIIP_OS v5.5 — 9200_EnterprisePerformanceDiagnosisProcessor
 */
function sciipRun9200_EnterprisePerformanceDiagnosisProcessor() {
  var cfg = {
    processorNumber: 9200,
    processorName: 'EnterprisePerformanceDiagnosis',
    layer: 'Enterprise Performance Diagnosis',
    sourceSheet: 'ENTERPRISE_PERFORMANCE_MEASUREMENT',
    targetSheet: 'ENTERPRISE_PERFORMANCE_DIAGNOSIS',
    statusField: 'enterprisePerformanceDiagnosisStatus',
    requiresSource: false,
    successMessage: 'Enterprise Performance Diagnosis completed for Enterprise Performance Execution.',
    nextAction: 'Run 9210_EnterprisePerformanceOptimizationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_PERFORMANCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9200_EnterprisePerformanceDiagnosisProcessor() {
  var result = sciipRun9200_EnterprisePerformanceDiagnosisProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9200_EnterprisePerformanceDiagnosisProcessor', result: result }));
  return result;
}
