function sciipRun24340_StoragePlatformHealthPlanningProcessor(){
  return SCIIP_STORAGE_PLATFORM_HEALTH_BACKEND.executePlatformHealthPlan({processorNumber:24340,processorName:'StoragePlatformHealthPlanning',statusField:'storagePlatformHealthPlanningStatus',component:'Storage Platform Health Execution',backendLayer:'Storage Platform Health',sourceSheet:'STORAGE_PLATFORM_HEALTH_RISK_ANALYSIS',targetSheet:'STORAGE_PLATFORM_HEALTH_PLANNING',nextAction:'Run 24350_StoragePlatformHealthExecutionProcessor after this processor completes.'});
}
function sciipTest24340_StoragePlatformHealthPlanningProcessor(){var result=sciipRun24340_StoragePlatformHealthPlanningProcessor();console.log(JSON.stringify({test:'sciipTest24340_StoragePlatformHealthPlanningProcessor',result:result}));return result;}
