function sciipRun21740_StorageFileStorePlanningProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21740,processorName:'StorageFileStorePlanning',statusField:'storageFileStorePlanningStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_RISK_ANALYSIS',targetSheet:'STORAGE_FILE_STORE_PLANNING',nextAction:'Run 21750_StorageFileStoreExecutionProcessor after this processor completes.'});
}
function sciipTest21740_StorageFileStorePlanningProcessor() {
  var result = sciipRun21740_StorageFileStorePlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21740_StorageFileStorePlanningProcessor',result:result}));
  return result;
}
