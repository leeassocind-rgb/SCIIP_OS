/**
 * SCIIP_OS v5.5 — 7390_TaskPrioritizationProcessor
 * Prioritizes workflow tasks for operational execution.
 */
function sciipRun7390_TaskPrioritizationProcessor() {
  var cfg = {
    processorNumber: 7390,
    processorName: 'TaskPrioritization',
    layer: 'Task Prioritization',
    sourceSheet: 'WORKFLOW_ORCHESTRATION',
    targetSheet: 'TASK_PRIORITIZATION',
    statusField: 'taskPrioritizationStatus',
    requiresSource: false,
    executionAction: 'Task Prioritization produced for execution orchestration.',
    successMessage: 'Prioritizes workflow tasks for operational execution.',
    nextAction: 'Run 7400_ExecutionResourceAllocationProcessor after this processor completes.'
  };
  return SCIIP_EXECUTION_ORCHESTRATION_INTELLIGENCE.runWithRuntimeBase(cfg);
}

function sciipTest7390_TaskPrioritizationProcessor() {
  var result = sciipRun7390_TaskPrioritizationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7390_TaskPrioritizationProcessor', result: result }));
  return result;
}
