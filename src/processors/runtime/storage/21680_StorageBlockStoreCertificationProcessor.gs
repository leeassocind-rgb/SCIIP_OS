function sciipRun21680_StorageBlockStoreCertificationProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21680,processorName:'StorageBlockStoreCertification',statusField:'storageBlockStoreCertificationStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_VALIDATION',targetSheet:'STORAGE_BLOCK_STORE_CERTIFICATION',nextAction:'Run 21690_StorageBlockStoreAcceptanceProcessor after this processor completes.'});
}
function sciipTest21680_StorageBlockStoreCertificationProcessor() {
  var result = sciipRun21680_StorageBlockStoreCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21680_StorageBlockStoreCertificationProcessor',result:result}));
  return result;
}
