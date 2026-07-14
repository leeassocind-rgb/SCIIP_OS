function sciipRun21840_StorageColdTierPlanningProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21840,processorName:'StorageColdTierPlanning',statusField:'storageColdTierPlanningStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_RISK_ANALYSIS',targetSheet:'STORAGE_COLD_TIER_PLANNING',nextAction:'Run 21850_StorageColdTierExecutionProcessor after this processor completes.'});
}
function sciipTest21840_StorageColdTierPlanningProcessor() {
  var result = sciipRun21840_StorageColdTierPlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21840_StorageColdTierPlanningProcessor',result:result}));
  return result;
}
