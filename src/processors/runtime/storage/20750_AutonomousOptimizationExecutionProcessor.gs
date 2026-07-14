function sciipRun20750_AutonomousOptimizationExecutionProcessor() {
  return SCIIP_STORAGE_AUTONOMOUS_OPTIMIZATION_BACKEND.executeAutonomousOptimizationPlan({
    processorNumber: 20750,
    processorName: 'AutonomousOptimizationExecution',
    statusField: 'autonomousOptimizationExecutionStatus',
    component: 'Storage Autonomous Optimization Execution',
    backendLayer: 'Storage Autonomous Optimization',
    sourceSheet: 'AUTONOMOUS_OPTIMIZATION_PLANNING',
    targetSheet: 'AUTONOMOUS_OPTIMIZATION_EXECUTION',
    nextAction: 'Run 20760_AutonomousOptimizationLedgerProcessor after this processor completes.'
  });
}

function sciipTest20750_AutonomousOptimizationExecutionProcessor() {
  var result = sciipRun20750_AutonomousOptimizationExecutionProcessor();
  console.log(JSON.stringify({test: 'sciipTest20750_AutonomousOptimizationExecutionProcessor', result: result}));
  return result;
}
