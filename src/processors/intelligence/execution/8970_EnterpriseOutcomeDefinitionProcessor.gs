/**
 * SCIIP_OS v5.5 — 8970_EnterpriseOutcomeDefinitionProcessor
 */
function sciipRun8970_EnterpriseOutcomeDefinitionProcessor() {
  var cfg = {
    processorNumber: 8970,
    processorName: 'EnterpriseOutcomeDefinition',
    layer: 'Enterprise Outcome Definition',
    sourceSheet: 'ENTERPRISE_OUTCOME_READINESS',
    targetSheet: 'ENTERPRISE_OUTCOME_DEFINITION',
    statusField: 'enterpriseOutcomeDefinitionStatus',
    requiresSource: false,
    successMessage: 'Enterprise Outcome Definition completed for Enterprise Outcome Execution.',
    nextAction: 'Run 8980_EnterpriseOutcomeMeasurementProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OUTCOME_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8970_EnterpriseOutcomeDefinitionProcessor() {
  var result = sciipRun8970_EnterpriseOutcomeDefinitionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8970_EnterpriseOutcomeDefinitionProcessor', result: result }));
  return result;
}
