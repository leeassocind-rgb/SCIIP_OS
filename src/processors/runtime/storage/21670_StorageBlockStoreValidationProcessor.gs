function sciipRun21670_StorageBlockStoreValidationProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21670,processorName:'StorageBlockStoreValidation',statusField:'storageBlockStoreValidationStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_LEDGER',targetSheet:'STORAGE_BLOCK_STORE_VALIDATION',nextAction:'Run 21680_StorageBlockStoreCertificationProcessor after this processor completes.'});
}
function sciipTest21670_StorageBlockStoreValidationProcessor() {
  var result = sciipRun21670_StorageBlockStoreValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21670_StorageBlockStoreValidationProcessor',result:result}));
  return result;
}
