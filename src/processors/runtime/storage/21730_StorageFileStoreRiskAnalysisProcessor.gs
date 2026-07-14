function sciipRun21730_StorageFileStoreRiskAnalysisProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21730,processorName:'StorageFileStoreRiskAnalysis',statusField:'storageFileStoreRiskAnalysisStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_FILE_STORE_RISK_ANALYSIS',nextAction:'Run 21740_StorageFileStorePlanningProcessor after this processor completes.'});
}
function sciipTest21730_StorageFileStoreRiskAnalysisProcessor() {
  var result = sciipRun21730_StorageFileStoreRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21730_StorageFileStoreRiskAnalysisProcessor',result:result}));
  return result;
}
