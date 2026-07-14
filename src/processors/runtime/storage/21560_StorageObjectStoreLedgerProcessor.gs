function sciipRun21560_StorageObjectStoreLedgerProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21560,processorName:'StorageObjectStoreLedger',statusField:'storageObjectStoreLedgerStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_EXECUTION',targetSheet:'STORAGE_OBJECT_STORE_LEDGER',nextAction:'Run 21570_StorageObjectStoreValidationProcessor after this processor completes.'});
}
function sciipTest21560_StorageObjectStoreLedgerProcessor() {
  var result = sciipRun21560_StorageObjectStoreLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21560_StorageObjectStoreLedgerProcessor',result:result}));
  return result;
}
