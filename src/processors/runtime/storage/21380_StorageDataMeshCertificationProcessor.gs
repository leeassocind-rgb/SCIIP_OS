function sciipRun21380_StorageDataMeshCertificationProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21380,processorName:'StorageDataMeshCertification',statusField:'storageDataMeshCertificationStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_VALIDATION',targetSheet:'STORAGE_DATA_MESH_CERTIFICATION',nextAction:'Run 21390_StorageDataMeshAcceptanceProcessor after this processor completes.'});
}
function sciipTest21380_StorageDataMeshCertificationProcessor() {
  var result = sciipRun21380_StorageDataMeshCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21380_StorageDataMeshCertificationProcessor',result:result}));
  return result;
}
