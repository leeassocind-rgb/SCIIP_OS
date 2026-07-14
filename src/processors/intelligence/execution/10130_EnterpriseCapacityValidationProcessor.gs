/**
 * SCIIP_OS v5.5 — 10130_EnterpriseCapacityValidationProcessor
 */
function sciipRun10130_EnterpriseCapacityValidationProcessor() {
  var cfg = {
    processorNumber: 10130,
    processorName: 'EnterpriseCapacityValidation',
    layer: 'Enterprise Capacity Validation',
    sourceSheet: 'ENTERPRISE_CAPACITY_GOVERNANCE',
    targetSheet: 'ENTERPRISE_CAPACITY_VALIDATIONS',
    statusField: 'enterpriseCapacityValidationStatus',
    requiresSource: false,
    successMessage: 'Enterprise Capacity Validation completed for Enterprise Capacity Execution.',
    nextAction: 'Run 10140_EnterpriseCapacityCertificationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_CAPACITY_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10130_EnterpriseCapacityValidationProcessor() {
  var result = sciipRun10130_EnterpriseCapacityValidationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10130_EnterpriseCapacityValidationProcessor', result: result }));
  return result;
}
