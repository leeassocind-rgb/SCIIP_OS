/**
 * SCIIP_OS v5.5 — 8900_EnterpriseObjectiveTrackingProcessor
 */
function sciipRun8900_EnterpriseObjectiveTrackingProcessor() {
  var cfg = {
    processorNumber: 8900,
    processorName: 'EnterpriseObjectiveTracking',
    layer: 'Enterprise Objective Tracking',
    sourceSheet: 'ENTERPRISE_OBJECTIVE_PRIORITIZATION',
    targetSheet: 'ENTERPRISE_OBJECTIVE_TRACKING',
    statusField: 'enterpriseObjectiveTrackingStatus',
    requiresSource: false,
    successMessage: 'Enterprise Objective Tracking completed for Enterprise Objective Execution.',
    nextAction: 'Run 8910_EnterpriseObjectiveControlProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OBJECTIVE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8900_EnterpriseObjectiveTrackingProcessor() {
  var result = sciipRun8900_EnterpriseObjectiveTrackingProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8900_EnterpriseObjectiveTrackingProcessor', result: result }));
  return result;
}
