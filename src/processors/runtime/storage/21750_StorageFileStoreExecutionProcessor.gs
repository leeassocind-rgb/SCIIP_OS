function sciipRun21750_StorageFileStoreExecutionProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21750,processorName:'StorageFileStoreExecution',statusField:'storageFileStoreExecutionStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_PLANNING',targetSheet:'STORAGE_FILE_STORE_EXECUTION',nextAction:'Run 21760_StorageFileStoreLedgerProcessor after this processor completes.'});
}
function sciipTest21750_StorageFileStoreExecutionProcessor() {
  var result = sciipRun21750_StorageFileStoreExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21750_StorageFileStoreExecutionProcessor',result:result}));
  return result;
}
