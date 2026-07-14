function sciipRun21640_StorageBlockStorePlanningProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21640,processorName:'StorageBlockStorePlanning',statusField:'storageBlockStorePlanningStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_RISK_ANALYSIS',targetSheet:'STORAGE_BLOCK_STORE_PLANNING',nextAction:'Run 21650_StorageBlockStoreExecutionProcessor after this processor completes.'});
}
function sciipTest21640_StorageBlockStorePlanningProcessor() {
  var result = sciipRun21640_StorageBlockStorePlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21640_StorageBlockStorePlanningProcessor',result:result}));
  return result;
}
