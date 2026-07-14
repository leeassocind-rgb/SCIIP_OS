function sciipRun21650_StorageBlockStoreExecutionProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21650,processorName:'StorageBlockStoreExecution',statusField:'storageBlockStoreExecutionStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_PLANNING',targetSheet:'STORAGE_BLOCK_STORE_EXECUTION',nextAction:'Run 21660_StorageBlockStoreLedgerProcessor after this processor completes.'});
}
function sciipTest21650_StorageBlockStoreExecutionProcessor() {
  var result = sciipRun21650_StorageBlockStoreExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21650_StorageBlockStoreExecutionProcessor',result:result}));
  return result;
}
