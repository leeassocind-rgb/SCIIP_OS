/**
 * SCIIP_OS v5.5 — 10190_EnterpriseLeverageMeasurementProcessor
 */
function sciipRun10190_EnterpriseLeverageMeasurementProcessor() {
  var cfg = {
    processorNumber: 10190,
    processorName: 'EnterpriseLeverageMeasurement',
    layer: 'Enterprise Leverage Measurement',
    sourceSheet: 'ENTERPRISE_LEVERAGE_SIGNAL',
    targetSheet: 'ENTERPRISE_LEVERAGE_MEASUREMENT',
    statusField: 'enterpriseLeverageMeasurementStatus',
    requiresSource: false,
    successMessage: 'Enterprise Leverage Measurement completed for Enterprise Leverage Execution.',
    nextAction: 'Run 10200_EnterpriseLeveragePlanningProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_LEVERAGE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10190_EnterpriseLeverageMeasurementProcessor() {
  var result = sciipRun10190_EnterpriseLeverageMeasurementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10190_EnterpriseLeverageMeasurementProcessor', result: result }));
  return result;
}
