function sciipRun20240_TieringPlanningProcessor() {
  return SCIIP_STORAGE_TIERING_BACKEND.executeTieringPlan({
    processorNumber: 20240,
    processorName: 'TieringPlanning',
    statusField: 'tieringPlanningStatus',
    component: 'Storage Tiering Execution',
    backendLayer: 'Storage Tiering',
    sourceSheet: 'TIER_PLACEMENT_ANALYSIS',
    targetSheet: 'TIERING_PLANNING',
    nextAction: 'Run 20250_TieringExecutionProcessor after this processor completes.'
  });
}

function sciipTest20240_TieringPlanningProcessor() {
  var result = sciipRun20240_TieringPlanningProcessor();
  console.log(JSON.stringify({test: 'sciipTest20240_TieringPlanningProcessor', result: result}));
  return result;
}
