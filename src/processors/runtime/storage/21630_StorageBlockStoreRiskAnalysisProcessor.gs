function sciipRun21630_StorageBlockStoreRiskAnalysisProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21630,processorName:'StorageBlockStoreRiskAnalysis',statusField:'storageBlockStoreRiskAnalysisStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_BLOCK_STORE_RISK_ANALYSIS',nextAction:'Run 21640_StorageBlockStorePlanningProcessor after this processor completes.'});
}
function sciipTest21630_StorageBlockStoreRiskAnalysisProcessor() {
  var result = sciipRun21630_StorageBlockStoreRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21630_StorageBlockStoreRiskAnalysisProcessor',result:result}));
  return result;
}
