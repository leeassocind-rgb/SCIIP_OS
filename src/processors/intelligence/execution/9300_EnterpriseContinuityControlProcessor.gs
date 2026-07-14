/**
 * SCIIP_OS v5.5 — 9300_EnterpriseContinuityControlProcessor
 */
function sciipRun9300_EnterpriseContinuityControlProcessor() {
  var cfg = {
    processorNumber: 9300,
    processorName: 'EnterpriseContinuityControl',
    layer: 'Enterprise Continuity Control',
    sourceSheet: 'ENTERPRISE_RECOVERY_PLANNING',
    targetSheet: 'ENTERPRISE_CONTINUITY_CONTROL',
    statusField: 'enterpriseContinuityControlStatus',
    requiresSource: false,
    successMessage: 'Enterprise Continuity Control completed for Enterprise Resilience Execution.',
    nextAction: 'Run 9310_EnterpriseResilienceOptimizationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_RESILIENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9300_EnterpriseContinuityControlProcessor() {
  var result = sciipRun9300_EnterpriseContinuityControlProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9300_EnterpriseContinuityControlProcessor', result: result }));
  return result;
}
