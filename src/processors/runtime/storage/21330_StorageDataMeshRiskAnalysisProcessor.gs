function sciipRun21330_StorageDataMeshRiskAnalysisProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21330,processorName:'StorageDataMeshRiskAnalysis',statusField:'storageDataMeshRiskAnalysisStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_DATA_MESH_RISK_ANALYSIS',nextAction:'Run 21340_StorageDataMeshPlanningProcessor after this processor completes.'});
}
function sciipTest21330_StorageDataMeshRiskAnalysisProcessor() {
  var result = sciipRun21330_StorageDataMeshRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21330_StorageDataMeshRiskAnalysisProcessor',result:result}));
  return result;
}
