function sciipRun21780_StorageFileStoreCertificationProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21780,processorName:'StorageFileStoreCertification',statusField:'storageFileStoreCertificationStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_VALIDATION',targetSheet:'STORAGE_FILE_STORE_CERTIFICATION',nextAction:'Run 21790_StorageFileStoreAcceptanceProcessor after this processor completes.'});
}
function sciipTest21780_StorageFileStoreCertificationProcessor() {
  var result = sciipRun21780_StorageFileStoreCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21780_StorageFileStoreCertificationProcessor',result:result}));
  return result;
}
