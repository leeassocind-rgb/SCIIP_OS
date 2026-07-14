function sciipRun21490_StorageDataLakehouseAcceptanceProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21490,processorName:'StorageDataLakehouseAcceptance',statusField:'storageDataLakehouseAcceptanceStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_CERTIFICATION',targetSheet:'STORAGE_DATA_LAKEHOUSE_ACCEPTANCE',nextAction:'Storage Data Lakehouse Execution accepted through 21490.'});
}
function sciipTest21490_StorageDataLakehouseAcceptanceProcessor() {
  var result = sciipRun21490_StorageDataLakehouseAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest21490_StorageDataLakehouseAcceptanceProcessor',result:result}));
  return result;
}
