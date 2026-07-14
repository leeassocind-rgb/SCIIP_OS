function sciipRun20220_TierUtilizationAssessmentProcessor() {
  return SCIIP_STORAGE_TIERING_BACKEND.executeTieringPlan({
    processorNumber: 20220,
    processorName: 'TierUtilizationAssessment',
    statusField: 'tierUtilizationAssessmentStatus',
    component: 'Storage Tiering Execution',
    backendLayer: 'Storage Tiering',
    sourceSheet: 'TIERING_POLICY_REGISTRY',
    targetSheet: 'TIER_UTILIZATION_ASSESSMENT',
    nextAction: 'Run 20230_TierPlacementAnalysisProcessor after this processor completes.'
  });
}

function sciipTest20220_TierUtilizationAssessmentProcessor() {
  var result = sciipRun20220_TierUtilizationAssessmentProcessor();
  console.log(JSON.stringify({test: 'sciipTest20220_TierUtilizationAssessmentProcessor', result: result}));
  return result;
}
