/**
 * SCIIP_OS v5.5 — 8980_EnterpriseOutcomeMeasurementProcessor
 */
function sciipRun8980_EnterpriseOutcomeMeasurementProcessor() {
  var cfg = {
    processorNumber: 8980,
    processorName: 'EnterpriseOutcomeMeasurement',
    layer: 'Enterprise Outcome Measurement',
    sourceSheet: 'ENTERPRISE_OUTCOME_DEFINITION',
    targetSheet: 'ENTERPRISE_OUTCOME_MEASUREMENT',
    statusField: 'enterpriseOutcomeMeasurementStatus',
    requiresSource: false,
    successMessage: 'Enterprise Outcome Measurement completed for Enterprise Outcome Execution.',
    nextAction: 'Run 8990_EnterpriseOutcomeAttributionProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OUTCOME_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8980_EnterpriseOutcomeMeasurementProcessor() {
  var result = sciipRun8980_EnterpriseOutcomeMeasurementProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8980_EnterpriseOutcomeMeasurementProcessor', result: result }));
  return result;
}
