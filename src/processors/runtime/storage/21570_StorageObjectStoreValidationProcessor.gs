function sciipRun21570_StorageObjectStoreValidationProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21570,processorName:'StorageObjectStoreValidation',statusField:'storageObjectStoreValidationStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_LEDGER',targetSheet:'STORAGE_OBJECT_STORE_VALIDATION',nextAction:'Run 21580_StorageObjectStoreCertificationProcessor after this processor completes.'});
}
function sciipTest21570_StorageObjectStoreValidationProcessor() {
  var result = sciipRun21570_StorageObjectStoreValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21570_StorageObjectStoreValidationProcessor',result:result}));
  return result;
}
