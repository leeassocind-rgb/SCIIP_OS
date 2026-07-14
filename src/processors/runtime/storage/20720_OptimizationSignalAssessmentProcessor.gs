function sciipRun20720_OptimizationSignalAssessmentProcessor() {
  return SCIIP_STORAGE_AUTONOMOUS_OPTIMIZATION_BACKEND.executeAutonomousOptimizationPlan({
    processorNumber: 20720,
    processorName: 'OptimizationSignalAssessment',
    statusField: 'optimizationSignalAssessmentStatus',
    component: 'Storage Autonomous Optimization Execution',
    backendLayer: 'Storage Autonomous Optimization',
    sourceSheet: 'AUTONOMOUS_OPTIMIZATION_POLICY_REGISTRY',
    targetSheet: 'OPTIMIZATION_SIGNAL_ASSESSMENT',
    nextAction: 'Run 20730_AutonomyRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest20720_OptimizationSignalAssessmentProcessor() {
  var result = sciipRun20720_OptimizationSignalAssessmentProcessor();
  console.log(JSON.stringify({test: 'sciipTest20720_OptimizationSignalAssessmentProcessor', result: result}));
  return result;
}
