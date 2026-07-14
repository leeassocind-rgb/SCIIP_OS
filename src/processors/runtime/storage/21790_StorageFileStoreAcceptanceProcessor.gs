function sciipRun21790_StorageFileStoreAcceptanceProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21790,processorName:'StorageFileStoreAcceptance',statusField:'storageFileStoreAcceptanceStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_CERTIFICATION',targetSheet:'STORAGE_FILE_STORE_ACCEPTANCE',nextAction:'Storage File Store Execution accepted through 21790.'});
}
function sciipTest21790_StorageFileStoreAcceptanceProcessor() {
  var result = sciipRun21790_StorageFileStoreAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest21790_StorageFileStoreAcceptanceProcessor',result:result}));
  return result;
}
