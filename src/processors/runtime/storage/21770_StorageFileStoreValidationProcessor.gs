function sciipRun21770_StorageFileStoreValidationProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21770,processorName:'StorageFileStoreValidation',statusField:'storageFileStoreValidationStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_LEDGER',targetSheet:'STORAGE_FILE_STORE_VALIDATION',nextAction:'Run 21780_StorageFileStoreCertificationProcessor after this processor completes.'});
}
function sciipTest21770_StorageFileStoreValidationProcessor() {
  var result = sciipRun21770_StorageFileStoreValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21770_StorageFileStoreValidationProcessor',result:result}));
  return result;
}
