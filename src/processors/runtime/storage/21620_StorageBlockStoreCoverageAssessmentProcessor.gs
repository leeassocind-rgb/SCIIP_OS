function sciipRun21620_StorageBlockStoreCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21620,processorName:'StorageBlockStoreCoverageAssessment',statusField:'storageBlockStoreCoverageAssessmentStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_POLICY_REGISTRY',targetSheet:'STORAGE_BLOCK_STORE_COVERAGE_ASSESSMENT',nextAction:'Run 21630_StorageBlockStoreRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21620_StorageBlockStoreCoverageAssessmentProcessor() {
  var result = sciipRun21620_StorageBlockStoreCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21620_StorageBlockStoreCoverageAssessmentProcessor',result:result}));
  return result;
}
