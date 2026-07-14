/**
 * SCIIP_OS v5.5 — 9890_EnterpriseVelocityPlanningProcessor
 */
function sciipRun9890_EnterpriseVelocityPlanningProcessor() {
  var cfg = {
    processorNumber: 9890,
    processorName: 'EnterpriseVelocityPlanning',
    layer: 'Enterprise Velocity Planning',
    sourceSheet: 'ENTERPRISE_VELOCITY_BASELINE',
    targetSheet: 'ENTERPRISE_VELOCITY_PLANNING',
    statusField: 'enterpriseVelocityPlanningStatus',
    requiresSource: false,
    successMessage: 'Enterprise Velocity Planning completed for Enterprise Velocity Execution.',
    nextAction: 'Run 9900_EnterpriseVelocityControlProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_VELOCITY_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9890_EnterpriseVelocityPlanningProcessor() {
  var result = sciipRun9890_EnterpriseVelocityPlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9890_EnterpriseVelocityPlanningProcessor', result: result }));
  return result;
}
