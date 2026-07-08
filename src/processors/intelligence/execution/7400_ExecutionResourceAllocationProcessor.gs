/**
 * SCIIP_OS v5.5 — 7400_ExecutionResourceAllocationProcessor
 * Allocates execution resources against prioritized tasks.
 */
function sciipRun7400_ExecutionResourceAllocationProcessor() {
  var cfg = {
    processorNumber: 7400,
    processorName: 'ExecutionResourceAllocation',
    layer: 'Execution Resource Allocation',
    sourceSheet: 'TASK_PRIORITIZATION',
    targetSheet: 'EXECUTION_RESOURCE_ALLOCATION',
    statusField: 'executionResourceAllocationStatus',
    requiresSource: false,
    executionAction: 'Execution Resource Allocation produced for execution orchestration.',
    successMessage: 'Allocates execution resources against prioritized tasks.',
    nextAction: 'Run 7410_ExecutionDependencyMappingProcessor after this processor completes.'
  };
  return SCIIP_EXECUTION_ORCHESTRATION_INTELLIGENCE.runWithRuntimeBase(cfg);
}

function sciipTest7400_ExecutionResourceAllocationProcessor() {
  var result = sciipRun7400_ExecutionResourceAllocationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7400_ExecutionResourceAllocationProcessor', result: result }));
  return result;
}
