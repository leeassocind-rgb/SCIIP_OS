function sciipRun20360_LifecycleAutomationLedgerProcessor() {
  return SCIIP_STORAGE_LIFECYCLE_AUTOMATION_BACKEND.executeLifecycleAutomationPlan({
    processorNumber: 20360,
    processorName: 'LifecycleAutomationLedger',
    statusField: 'lifecycleAutomationLedgerStatus',
    component: 'Storage Lifecycle Automation Execution',
    backendLayer: 'Storage Lifecycle Automation',
    sourceSheet: 'LIFECYCLE_AUTOMATION_EXECUTION',
    targetSheet: 'LIFECYCLE_AUTOMATION_LEDGER',
    nextAction: 'Run 20370_LifecycleAutomationValidationProcessor after this processor completes.'
  });
}

function sciipTest20360_LifecycleAutomationLedgerProcessor() {
  var result = sciipRun20360_LifecycleAutomationLedgerProcessor();
  console.log(JSON.stringify({test: 'sciipTest20360_LifecycleAutomationLedgerProcessor', result: result}));
  return result;
}
