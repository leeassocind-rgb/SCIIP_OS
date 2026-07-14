function sciipRun20210_TieringPolicyRegistryProcessor() {
  return SCIIP_STORAGE_TIERING_BACKEND.executeTieringPlan({
    processorNumber: 20210,
    processorName: 'TieringPolicyRegistry',
    statusField: 'tieringPolicyRegistryStatus',
    component: 'Storage Tiering Execution',
    backendLayer: 'Storage Tiering',
    sourceSheet: 'STORAGE_TIERING_READINESS',
    targetSheet: 'TIERING_POLICY_REGISTRY',
    nextAction: 'Run 20220_TierUtilizationAssessmentProcessor after this processor completes.'
  });
}

function sciipTest20210_TieringPolicyRegistryProcessor() {
  var result = sciipRun20210_TieringPolicyRegistryProcessor();
  console.log(JSON.stringify({test: 'sciipTest20210_TieringPolicyRegistryProcessor', result: result}));
  return result;
}
