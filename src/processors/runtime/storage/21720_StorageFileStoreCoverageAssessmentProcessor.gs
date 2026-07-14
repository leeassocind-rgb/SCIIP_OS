function sciipRun21720_StorageFileStoreCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21720,processorName:'StorageFileStoreCoverageAssessment',statusField:'storageFileStoreCoverageAssessmentStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_POLICY_REGISTRY',targetSheet:'STORAGE_FILE_STORE_COVERAGE_ASSESSMENT',nextAction:'Run 21730_StorageFileStoreRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21720_StorageFileStoreCoverageAssessmentProcessor() {
  var result = sciipRun21720_StorageFileStoreCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21720_StorageFileStoreCoverageAssessmentProcessor',result:result}));
  return result;
}
