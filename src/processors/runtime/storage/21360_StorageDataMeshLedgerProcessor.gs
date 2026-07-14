function sciipRun21360_StorageDataMeshLedgerProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21360,processorName:'StorageDataMeshLedger',statusField:'storageDataMeshLedgerStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_EXECUTION',targetSheet:'STORAGE_DATA_MESH_LEDGER',nextAction:'Run 21370_StorageDataMeshValidationProcessor after this processor completes.'});
}
function sciipTest21360_StorageDataMeshLedgerProcessor() {
  var result = sciipRun21360_StorageDataMeshLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21360_StorageDataMeshLedgerProcessor',result:result}));
  return result;
}
