/**
 * SCIIP_OS v6.0 — 15330 TieringPlanning
 */
function sciipRun15330_TieringPlanningProcessor() {
  return SCIIP_STORAGE_LIFECYCLE_BACKEND.executeLifecyclePlan({
    processorNumber: 15330,
    processorName: 'TieringPlanning',
    statusField: 'tieringPlanningStatus',
    component: 'Storage Lifecycle Execution',
    backendLayer: 'Storage Lifecycle',
    sourceSheet: 'DATA_AGE_ASSESSMENT',
    targetSheet: 'TIERING_PLANNING',
    nextAction: 'Run 15340_ArchivalPlanningProcessor after this processor completes.'
  });
}

function sciipTest15330_TieringPlanningProcessor() {
  var result = sciipRun15330_TieringPlanningProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest15330_TieringPlanningProcessor',
    result: result
  }));
  return result;
}
