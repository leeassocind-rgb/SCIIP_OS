/**
 * SCIIP_OS v5.5 — 10080_EnterpriseCapacitySignalProcessor
 */
function sciipRun10080_EnterpriseCapacitySignalProcessor() {
  var cfg = {
    processorNumber: 10080,
    processorName: 'EnterpriseCapacitySignal',
    layer: 'Enterprise Capacity Signal',
    sourceSheet: 'ENTERPRISE_CAPACITY_BASELINE',
    targetSheet: 'ENTERPRISE_CAPACITY_SIGNAL',
    statusField: 'enterpriseCapacitySignalStatus',
    requiresSource: false,
    successMessage: 'Enterprise Capacity Signal completed for Enterprise Capacity Execution.',
    nextAction: 'Run 10090_EnterpriseCapacityMeasurementProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_CAPACITY_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10080_EnterpriseCapacitySignalProcessor() {
  var result = sciipRun10080_EnterpriseCapacitySignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10080_EnterpriseCapacitySignalProcessor', result: result }));
  return result;
}
