/**
 * SCIIP_OS v5.5 — 9090_EnterpriseValueMeasurementProcessor
 */
function sciipRun9090_EnterpriseValueMeasurementProcessor() {
  var cfg = {
    processorNumber: 9090,
    processorName: 'EnterpriseValueMeasurement',
    layer: 'Enterprise Value Measurement',
    sourceSheet: 'ENTERPRISE_VALUE_MAPPING',
    targetSheet: 'ENTERPRISE_VALUE_MEASUREMENT',
    statusField: 'enterpriseValueMeasurementStatus',
    requiresSource: false,
    successMessage: 'Enterprise Value Measurement completed for Enterprise Value Execution.',
    nextAction: 'Run 9100_EnterpriseValueRealizationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_VALUE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9090_EnterpriseValueMeasurementProcessor() {
  var result = sciipRun9090_EnterpriseValueMeasurementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9090_EnterpriseValueMeasurementProcessor', result: result }));
  return result;
}
