/**
 * SCIIP_OS v5.5 — 8880_EnterpriseObjectiveAlignmentProcessor
 */
function sciipRun8880_EnterpriseObjectiveAlignmentProcessor() {
  var cfg = {
    processorNumber: 8880,
    processorName: 'EnterpriseObjectiveAlignment',
    layer: 'Enterprise Objective Alignment',
    sourceSheet: 'ENTERPRISE_OBJECTIVE_DEFINITION',
    targetSheet: 'ENTERPRISE_OBJECTIVE_ALIGNMENT',
    statusField: 'enterpriseObjectiveAlignmentStatus',
    requiresSource: false,
    successMessage: 'Enterprise Objective Alignment completed for Enterprise Objective Execution.',
    nextAction: 'Run 8890_EnterpriseObjectivePrioritizationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OBJECTIVE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8880_EnterpriseObjectiveAlignmentProcessor() {
  var result = sciipRun8880_EnterpriseObjectiveAlignmentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8880_EnterpriseObjectiveAlignmentProcessor', result: result }));
  return result;
}
