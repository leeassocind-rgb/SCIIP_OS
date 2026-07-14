function sciipRun21530_StorageObjectStoreRiskAnalysisProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21530,processorName:'StorageObjectStoreRiskAnalysis',statusField:'storageObjectStoreRiskAnalysisStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_OBJECT_STORE_RISK_ANALYSIS',nextAction:'Run 21540_StorageObjectStorePlanningProcessor after this processor completes.'});
}
function sciipTest21530_StorageObjectStoreRiskAnalysisProcessor() {
  var result = sciipRun21530_StorageObjectStoreRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21530_StorageObjectStoreRiskAnalysisProcessor',result:result}));
  return result;
}
