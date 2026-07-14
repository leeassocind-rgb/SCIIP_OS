/**
 * SCIIP_OS v5.5 — 9290_EnterpriseRecoveryPlanningProcessor
 */
function sciipRun9290_EnterpriseRecoveryPlanningProcessor() {
  var cfg = {
    processorNumber: 9290,
    processorName: 'EnterpriseRecoveryPlanning',
    layer: 'Enterprise Recovery Planning',
    sourceSheet: 'ENTERPRISE_RISK_ABSORPTION',
    targetSheet: 'ENTERPRISE_RECOVERY_PLANNING',
    statusField: 'enterpriseRecoveryPlanningStatus',
    requiresSource: false,
    successMessage: 'Enterprise Recovery Planning completed for Enterprise Resilience Execution.',
    nextAction: 'Run 9300_EnterpriseContinuityControlProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_RESILIENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9290_EnterpriseRecoveryPlanningProcessor() {
  var result = sciipRun9290_EnterpriseRecoveryPlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9290_EnterpriseRecoveryPlanningProcessor', result: result }));
  return result;
}
