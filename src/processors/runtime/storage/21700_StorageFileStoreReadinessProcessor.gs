function sciipRun21700_StorageFileStoreReadinessProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21700,processorName:'StorageFileStoreReadiness',statusField:'storageFileStoreReadinessStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'BLOCK_STORE_ACCEPTANCES',targetSheet:'STORAGE_FILE_STORE_READINESS',nextAction:'Run 21710_StorageFileStorePolicyRegistryProcessor after this processor completes.'});
}
function sciipTest21700_StorageFileStoreReadinessProcessor() {
  var result = sciipRun21700_StorageFileStoreReadinessProcessor();
  console.log(JSON.stringify({test:'sciipTest21700_StorageFileStoreReadinessProcessor',result:result}));
  return result;
}
