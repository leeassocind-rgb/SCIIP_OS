function sciipRun21540_StorageObjectStorePlanningProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21540,processorName:'StorageObjectStorePlanning',statusField:'storageObjectStorePlanningStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_RISK_ANALYSIS',targetSheet:'STORAGE_OBJECT_STORE_PLANNING',nextAction:'Run 21550_StorageObjectStoreExecutionProcessor after this processor completes.'});
}
function sciipTest21540_StorageObjectStorePlanningProcessor() {
  var result = sciipRun21540_StorageObjectStorePlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21540_StorageObjectStorePlanningProcessor',result:result}));
  return result;
}
