/**
 * SCIIP_OS v5.5 — 10090_EnterpriseCapacityMeasurementProcessor
 */
function sciipRun10090_EnterpriseCapacityMeasurementProcessor() {
  var cfg = {
    processorNumber: 10090,
    processorName: 'EnterpriseCapacityMeasurement',
    layer: 'Enterprise Capacity Measurement',
    sourceSheet: 'ENTERPRISE_CAPACITY_SIGNAL',
    targetSheet: 'ENTERPRISE_CAPACITY_MEASUREMENT',
    statusField: 'enterpriseCapacityMeasurementStatus',
    requiresSource: false,
    successMessage: 'Enterprise Capacity Measurement completed for Enterprise Capacity Execution.',
    nextAction: 'Run 10100_EnterpriseCapacityPlanningProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_CAPACITY_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10090_EnterpriseCapacityMeasurementProcessor() {
  var result = sciipRun10090_EnterpriseCapacityMeasurementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10090_EnterpriseCapacityMeasurementProcessor', result: result }));
  return result;
}
