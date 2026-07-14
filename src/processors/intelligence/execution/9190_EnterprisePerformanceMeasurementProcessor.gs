/**
 * SCIIP_OS v5.5 — 9190_EnterprisePerformanceMeasurementProcessor
 */
function sciipRun9190_EnterprisePerformanceMeasurementProcessor() {
  var cfg = {
    processorNumber: 9190,
    processorName: 'EnterprisePerformanceMeasurement',
    layer: 'Enterprise Performance Measurement',
    sourceSheet: 'ENTERPRISE_PERFORMANCE_SIGNAL',
    targetSheet: 'ENTERPRISE_PERFORMANCE_MEASUREMENT',
    statusField: 'enterprisePerformanceMeasurementStatus',
    requiresSource: false,
    successMessage: 'Enterprise Performance Measurement completed for Enterprise Performance Execution.',
    nextAction: 'Run 9200_EnterprisePerformanceDiagnosisProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_PERFORMANCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9190_EnterprisePerformanceMeasurementProcessor() {
  var result = sciipRun9190_EnterprisePerformanceMeasurementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9190_EnterprisePerformanceMeasurementProcessor', result: result }));
  return result;
}
