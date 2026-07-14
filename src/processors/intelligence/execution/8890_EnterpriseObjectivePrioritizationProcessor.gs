/**
 * SCIIP_OS v5.5 — 8890_EnterpriseObjectivePrioritizationProcessor
 */
function sciipRun8890_EnterpriseObjectivePrioritizationProcessor() {
  var cfg = {
    processorNumber: 8890,
    processorName: 'EnterpriseObjectivePrioritization',
    layer: 'Enterprise Objective Prioritization',
    sourceSheet: 'ENTERPRISE_OBJECTIVE_ALIGNMENT',
    targetSheet: 'ENTERPRISE_OBJECTIVE_PRIORITIZATION',
    statusField: 'enterpriseObjectivePrioritizationStatus',
    requiresSource: false,
    successMessage: 'Enterprise Objective Prioritization completed for Enterprise Objective Execution.',
    nextAction: 'Run 8900_EnterpriseObjectiveTrackingProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OBJECTIVE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8890_EnterpriseObjectivePrioritizationProcessor() {
  var result = sciipRun8890_EnterpriseObjectivePrioritizationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8890_EnterpriseObjectivePrioritizationProcessor', result: result }));
  return result;
}
