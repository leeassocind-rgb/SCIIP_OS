function sciipRun21660_StorageBlockStoreLedgerProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21660,processorName:'StorageBlockStoreLedger',statusField:'storageBlockStoreLedgerStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_EXECUTION',targetSheet:'STORAGE_BLOCK_STORE_LEDGER',nextAction:'Run 21670_StorageBlockStoreValidationProcessor after this processor completes.'});
}
function sciipTest21660_StorageBlockStoreLedgerProcessor() {
  var result = sciipRun21660_StorageBlockStoreLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21660_StorageBlockStoreLedgerProcessor',result:result}));
  return result;
}
