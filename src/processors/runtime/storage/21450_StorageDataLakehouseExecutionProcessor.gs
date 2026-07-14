function sciipRun21450_StorageDataLakehouseExecutionProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21450,processorName:'StorageDataLakehouseExecution',statusField:'storageDataLakehouseExecutionStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_PLANNING',targetSheet:'STORAGE_DATA_LAKEHOUSE_EXECUTION',nextAction:'Run 21460_StorageDataLakehouseLedgerProcessor after this processor completes.'});
}
function sciipTest21450_StorageDataLakehouseExecutionProcessor() {
  var result = sciipRun21450_StorageDataLakehouseExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21450_StorageDataLakehouseExecutionProcessor',result:result}));
  return result;
}
