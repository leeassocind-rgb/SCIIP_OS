function sciipRun21340_StorageDataMeshPlanningProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21340,processorName:'StorageDataMeshPlanning',statusField:'storageDataMeshPlanningStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_RISK_ANALYSIS',targetSheet:'STORAGE_DATA_MESH_PLANNING',nextAction:'Run 21350_StorageDataMeshExecutionProcessor after this processor completes.'});
}
function sciipTest21340_StorageDataMeshPlanningProcessor() {
  var result = sciipRun21340_StorageDataMeshPlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21340_StorageDataMeshPlanningProcessor',result:result}));
  return result;
}
