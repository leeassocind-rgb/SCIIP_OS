function sciipRun20200_StorageTieringReadinessProcessor() {
  return SCIIP_STORAGE_TIERING_BACKEND.executeTieringPlan({
    processorNumber: 20200,
    processorName: 'StorageTieringReadiness',
    statusField: 'storageTieringReadinessStatus',
    component: 'Storage Tiering Execution',
    backendLayer: 'Storage Tiering',
    sourceSheet: 'CLOUD_FEDERATION_ACCEPTANCES',
    targetSheet: 'STORAGE_TIERING_READINESS',
    nextAction: 'Run 20210_TieringPolicyRegistryProcessor after this processor completes.'
  });
}

function sciipTest20200_StorageTieringReadinessProcessor() {
  var result = sciipRun20200_StorageTieringReadinessProcessor();
  console.log(JSON.stringify({test: 'sciipTest20200_StorageTieringReadinessProcessor', result: result}));
  return result;
}
