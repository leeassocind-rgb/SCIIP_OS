function sciipRun21550_StorageObjectStoreExecutionProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21550,processorName:'StorageObjectStoreExecution',statusField:'storageObjectStoreExecutionStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_PLANNING',targetSheet:'STORAGE_OBJECT_STORE_EXECUTION',nextAction:'Run 21560_StorageObjectStoreLedgerProcessor after this processor completes.'});
}
function sciipTest21550_StorageObjectStoreExecutionProcessor() {
  var result = sciipRun21550_StorageObjectStoreExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21550_StorageObjectStoreExecutionProcessor',result:result}));
  return result;
}
