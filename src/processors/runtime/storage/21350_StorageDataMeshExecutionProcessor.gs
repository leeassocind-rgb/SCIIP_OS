function sciipRun21350_StorageDataMeshExecutionProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21350,processorName:'StorageDataMeshExecution',statusField:'storageDataMeshExecutionStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_PLANNING',targetSheet:'STORAGE_DATA_MESH_EXECUTION',nextAction:'Run 21360_StorageDataMeshLedgerProcessor after this processor completes.'});
}
function sciipTest21350_StorageDataMeshExecutionProcessor() {
  var result = sciipRun21350_StorageDataMeshExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21350_StorageDataMeshExecutionProcessor',result:result}));
  return result;
}
