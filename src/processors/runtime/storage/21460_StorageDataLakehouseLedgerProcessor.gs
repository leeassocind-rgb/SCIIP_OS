function sciipRun21460_StorageDataLakehouseLedgerProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21460,processorName:'StorageDataLakehouseLedger',statusField:'storageDataLakehouseLedgerStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_EXECUTION',targetSheet:'STORAGE_DATA_LAKEHOUSE_LEDGER',nextAction:'Run 21470_StorageDataLakehouseValidationProcessor after this processor completes.'});
}
function sciipTest21460_StorageDataLakehouseLedgerProcessor() {
  var result = sciipRun21460_StorageDataLakehouseLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21460_StorageDataLakehouseLedgerProcessor',result:result}));
  return result;
}
