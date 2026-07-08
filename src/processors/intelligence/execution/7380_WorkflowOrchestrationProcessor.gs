/**
 * SCIIP_OS v5.5 — 7380_WorkflowOrchestrationProcessor
 * Creates workflow orchestration records from execution plans.
 */
function sciipRun7380_WorkflowOrchestrationProcessor() {
  var cfg = {
    processorNumber: 7380,
    processorName: 'WorkflowOrchestration',
    layer: 'Workflow Orchestration',
    sourceSheet: 'EXECUTION_PLAN_ASSEMBLY',
    targetSheet: 'WORKFLOW_ORCHESTRATION',
    statusField: 'workflowOrchestrationStatus',
    requiresSource: false,
    executionAction: 'Workflow Orchestration produced for execution orchestration.',
    successMessage: 'Creates workflow orchestration records from execution plans.',
    nextAction: 'Run 7390_TaskPrioritizationProcessor after this processor completes.'
  };
  return SCIIP_EXECUTION_ORCHESTRATION_INTELLIGENCE.runWithRuntimeBase(cfg);
}

function sciipTest7380_WorkflowOrchestrationProcessor() {
  var result = sciipRun7380_WorkflowOrchestrationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7380_WorkflowOrchestrationProcessor', result: result }));
  return result;
}
