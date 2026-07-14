function sciipRun21470_StorageDataLakehouseValidationProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21470,processorName:'StorageDataLakehouseValidation',statusField:'storageDataLakehouseValidationStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_LEDGER',targetSheet:'STORAGE_DATA_LAKEHOUSE_VALIDATION',nextAction:'Run 21480_StorageDataLakehouseCertificationProcessor after this processor completes.'});
}
function sciipTest21470_StorageDataLakehouseValidationProcessor() {
  var result = sciipRun21470_StorageDataLakehouseValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21470_StorageDataLakehouseValidationProcessor',result:result}));
  return result;
}
