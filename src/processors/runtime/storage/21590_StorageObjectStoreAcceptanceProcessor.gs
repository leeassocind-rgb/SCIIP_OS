function sciipRun21590_StorageObjectStoreAcceptanceProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21590,processorName:'StorageObjectStoreAcceptance',statusField:'storageObjectStoreAcceptanceStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_CERTIFICATION',targetSheet:'STORAGE_OBJECT_STORE_ACCEPTANCE',nextAction:'Storage Object Store Execution accepted through 21590.'});
}
function sciipTest21590_StorageObjectStoreAcceptanceProcessor() {
  var result = sciipRun21590_StorageObjectStoreAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest21590_StorageObjectStoreAcceptanceProcessor',result:result}));
  return result;
}
