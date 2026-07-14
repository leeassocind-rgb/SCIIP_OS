function sciipRun20410_HeatMapPolicyRegistryProcessor() {
  return SCIIP_STORAGE_HEAT_MAP_BACKEND.executeHeatMapPlan({
    processorNumber: 20410,
    processorName: 'HeatMapPolicyRegistry',
    statusField: 'heatMapPolicyRegistryStatus',
    component: 'Storage Heat Map Execution',
    backendLayer: 'Storage Heat Map',
    sourceSheet: 'STORAGE_HEAT_MAP_READINESS',
    targetSheet: 'HEAT_MAP_POLICY_REGISTRY',
    nextAction: 'Run 20420_AccessTemperatureAssessmentProcessor after this processor completes.'
  });
}

function sciipTest20410_HeatMapPolicyRegistryProcessor() {
  var result = sciipRun20410_HeatMapPolicyRegistryProcessor();
  console.log(JSON.stringify({test: 'sciipTest20410_HeatMapPolicyRegistryProcessor', result: result}));
  return result;
}
