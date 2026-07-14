function sciipRun21520_StorageObjectStoreCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21520,processorName:'StorageObjectStoreCoverageAssessment',statusField:'storageObjectStoreCoverageAssessmentStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_POLICY_REGISTRY',targetSheet:'STORAGE_OBJECT_STORE_COVERAGE_ASSESSMENT',nextAction:'Run 21530_StorageObjectStoreRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21520_StorageObjectStoreCoverageAssessmentProcessor() {
  var result = sciipRun21520_StorageObjectStoreCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21520_StorageObjectStoreCoverageAssessmentProcessor',result:result}));
  return result;
}
