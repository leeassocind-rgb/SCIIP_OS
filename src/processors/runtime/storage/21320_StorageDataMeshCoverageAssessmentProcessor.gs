function sciipRun21320_StorageDataMeshCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_DATA_MESH_BACKEND.executeDataMeshPlan({processorNumber:21320,processorName:'StorageDataMeshCoverageAssessment',statusField:'storageDataMeshCoverageAssessmentStatus',component:'Storage Data Mesh Execution',backendLayer:'Storage Data Mesh',sourceSheet:'STORAGE_DATA_MESH_POLICY_REGISTRY',targetSheet:'STORAGE_DATA_MESH_COVERAGE_ASSESSMENT',nextAction:'Run 21330_StorageDataMeshRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21320_StorageDataMeshCoverageAssessmentProcessor() {
  var result = sciipRun21320_StorageDataMeshCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21320_StorageDataMeshCoverageAssessmentProcessor',result:result}));
  return result;
}
