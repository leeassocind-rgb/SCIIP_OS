function sciipRun21480_StorageDataLakehouseCertificationProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21480,processorName:'StorageDataLakehouseCertification',statusField:'storageDataLakehouseCertificationStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_VALIDATION',targetSheet:'STORAGE_DATA_LAKEHOUSE_CERTIFICATION',nextAction:'Run 21490_StorageDataLakehouseAcceptanceProcessor after this processor completes.'});
}
function sciipTest21480_StorageDataLakehouseCertificationProcessor() {
  var result = sciipRun21480_StorageDataLakehouseCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21480_StorageDataLakehouseCertificationProcessor',result:result}));
  return result;
}
