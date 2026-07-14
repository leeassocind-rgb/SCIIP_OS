function sciipRun20350_LifecycleAutomationExecutionProcessor() {
  return SCIIP_STORAGE_LIFECYCLE_AUTOMATION_BACKEND.executeLifecycleAutomationPlan({
    processorNumber: 20350,
    processorName: 'LifecycleAutomationExecution',
    statusField: 'lifecycleAutomationExecutionStatus',
    component: 'Storage Lifecycle Automation Execution',
    backendLayer: 'Storage Lifecycle Automation',
    sourceSheet: 'LIFECYCLE_AUTOMATION_PLANNING',
    targetSheet: 'LIFECYCLE_AUTOMATION_EXECUTION',
    nextAction: 'Run 20360_LifecycleAutomationLedgerProcessor after this processor completes.'
  });
}

function sciipTest20350_LifecycleAutomationExecutionProcessor() {
  var result = sciipRun20350_LifecycleAutomationExecutionProcessor();
  console.log(JSON.stringify({test: 'sciipTest20350_LifecycleAutomationExecutionProcessor', result: result}));
  return result;
}
