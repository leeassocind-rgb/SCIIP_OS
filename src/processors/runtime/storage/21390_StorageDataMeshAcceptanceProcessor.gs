function sciipRun21390_StorageDataMeshAcceptanceProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21390,processorName:'StorageDataMeshAcceptance',statusField:'storageDataMeshAcceptanceStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_CERTIFICATION',targetSheet:'STORAGE_DATA_MESH_ACCEPTANCE',nextAction:'Storage Data Mesh Execution accepted through 21390.'});
}
function sciipTest21390_StorageDataMeshAcceptanceProcessor() {
  var result = sciipRun21390_StorageDataMeshAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest21390_StorageDataMeshAcceptanceProcessor',result:result}));
  return result;
}
