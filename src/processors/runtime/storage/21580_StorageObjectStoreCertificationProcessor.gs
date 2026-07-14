function sciipRun21580_StorageObjectStoreCertificationProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21580,processorName:'StorageObjectStoreCertification',statusField:'storageObjectStoreCertificationStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_VALIDATION',targetSheet:'STORAGE_OBJECT_STORE_CERTIFICATION',nextAction:'Run 21590_StorageObjectStoreAcceptanceProcessor after this processor completes.'});
}
function sciipTest21580_StorageObjectStoreCertificationProcessor() {
  var result = sciipRun21580_StorageObjectStoreCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21580_StorageObjectStoreCertificationProcessor',result:result}));
  return result;
}
