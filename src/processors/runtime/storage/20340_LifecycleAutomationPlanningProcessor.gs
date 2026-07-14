function sciipRun20340_LifecycleAutomationPlanningProcessor() {
  return SCIIP_STORAGE_LIFECYCLE_AUTOMATION_BACKEND.executeLifecycleAutomationPlan({
    processorNumber: 20340,
    processorName: 'LifecycleAutomationPlanning',
    statusField: 'lifecycleAutomationPlanningStatus',
    component: 'Storage Lifecycle Automation Execution',
    backendLayer: 'Storage Lifecycle Automation',
    sourceSheet: 'LIFECYCLE_AUTOMATION_GAP_ANALYSIS',
    targetSheet: 'LIFECYCLE_AUTOMATION_PLANNING',
    nextAction: 'Run 20350_LifecycleAutomationExecutionProcessor after this processor completes.'
  });
}

function sciipTest20340_LifecycleAutomationPlanningProcessor() {
  var result = sciipRun20340_LifecycleAutomationPlanningProcessor();
  console.log(JSON.stringify({test: 'sciipTest20340_LifecycleAutomationPlanningProcessor', result: result}));
  return result;
}
