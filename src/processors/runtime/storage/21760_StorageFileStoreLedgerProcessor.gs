function sciipRun21760_StorageFileStoreLedgerProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21760,processorName:'StorageFileStoreLedger',statusField:'storageFileStoreLedgerStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_EXECUTION',targetSheet:'STORAGE_FILE_STORE_LEDGER',nextAction:'Run 21770_StorageFileStoreValidationProcessor after this processor completes.'});
}
function sciipTest21760_StorageFileStoreLedgerProcessor() {
  var result = sciipRun21760_StorageFileStoreLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21760_StorageFileStoreLedgerProcessor',result:result}));
  return result;
}
