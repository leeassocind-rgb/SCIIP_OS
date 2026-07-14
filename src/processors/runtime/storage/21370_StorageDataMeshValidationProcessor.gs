function sciipRun21370_StorageDataMeshValidationProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21370,processorName:'StorageDataMeshValidation',statusField:'storageDataMeshValidationStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_LEDGER',targetSheet:'STORAGE_DATA_MESH_VALIDATION',nextAction:'Run 21380_StorageDataMeshCertificationProcessor after this processor completes.'});
}
function sciipTest21370_StorageDataMeshValidationProcessor() {
  var result = sciipRun21370_StorageDataMeshValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21370_StorageDataMeshValidationProcessor',result:result}));
  return result;
}
