function sciipRun20330_LifecycleAutomationGapAnalysisProcessor() {
  return SCIIP_STORAGE_LIFECYCLE_AUTOMATION_BACKEND.executeLifecycleAutomationPlan({
    processorNumber: 20330,
    processorName: 'LifecycleAutomationGapAnalysis',
    statusField: 'lifecycleAutomationGapAnalysisStatus',
    component: 'Storage Lifecycle Automation Execution',
    backendLayer: 'Storage Lifecycle Automation',
    sourceSheet: 'LIFECYCLE_TRIGGER_ASSESSMENT',
    targetSheet: 'LIFECYCLE_AUTOMATION_GAP_ANALYSIS',
    nextAction: 'Run 20340_LifecycleAutomationPlanningProcessor after this processor completes.'
  });
}

function sciipTest20330_LifecycleAutomationGapAnalysisProcessor() {
  var result = sciipRun20330_LifecycleAutomationGapAnalysisProcessor();
  console.log(JSON.stringify({test: 'sciipTest20330_LifecycleAutomationGapAnalysisProcessor', result: result}));
  return result;
}
