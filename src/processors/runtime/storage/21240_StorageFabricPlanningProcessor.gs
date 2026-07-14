function sciipRun21240_StorageFabricPlanningProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21240,processorName:'StorageFabricPlanning',statusField:'storageFabricPlanningStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_RISK_ANALYSIS',targetSheet:'STORAGE_FABRIC_PLANNING',nextAction:'Run 21250_StorageFabricExecutionProcessor after this processor completes.'});
}
function sciipTest21240_StorageFabricPlanningProcessor() {
  var result = sciipRun21240_StorageFabricPlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21240_StorageFabricPlanningProcessor',result:result}));
  return result;
}
