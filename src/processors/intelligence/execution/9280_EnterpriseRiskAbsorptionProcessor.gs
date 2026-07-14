/**
 * SCIIP_OS v5.5 — 9280_EnterpriseRiskAbsorptionProcessor
 */
function sciipRun9280_EnterpriseRiskAbsorptionProcessor() {
  var cfg = {
    processorNumber: 9280,
    processorName: 'EnterpriseRiskAbsorption',
    layer: 'Enterprise Risk Absorption',
    sourceSheet: 'ENTERPRISE_RESILIENCE_BASELINE',
    targetSheet: 'ENTERPRISE_RISK_ABSORPTION',
    statusField: 'enterpriseRiskAbsorptionStatus',
    requiresSource: false,
    successMessage: 'Enterprise Risk Absorption completed for Enterprise Resilience Execution.',
    nextAction: 'Run 9290_EnterpriseRecoveryPlanningProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_RESILIENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9280_EnterpriseRiskAbsorptionProcessor() {
  var result = sciipRun9280_EnterpriseRiskAbsorptionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9280_EnterpriseRiskAbsorptionProcessor', result: result }));
  return result;
}
