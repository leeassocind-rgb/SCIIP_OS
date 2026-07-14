function sciipRun21300_StorageDataMeshReadinessProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21300,processorName:'StorageDataMeshReadiness',statusField:'storageDataMeshReadinessStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'FABRIC_ACCEPTANCES',targetSheet:'STORAGE_DATA_MESH_READINESS',nextAction:'Run 21310_StorageDataMeshPolicyRegistryProcessor after this processor completes.'});
}
function sciipTest21300_StorageDataMeshReadinessProcessor() {
  var result = sciipRun21300_StorageDataMeshReadinessProcessor();
  console.log(JSON.stringify({test:'sciipTest21300_StorageDataMeshReadinessProcessor',result:result}));
  return result;
}
