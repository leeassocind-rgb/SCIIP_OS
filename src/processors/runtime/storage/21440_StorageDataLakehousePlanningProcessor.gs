function sciipRun21440_StorageDataLakehousePlanningProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21440,processorName:'StorageDataLakehousePlanning',statusField:'storageDataLakehousePlanningStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_RISK_ANALYSIS',targetSheet:'STORAGE_DATA_LAKEHOUSE_PLANNING',nextAction:'Run 21450_StorageDataLakehouseExecutionProcessor after this processor completes.'});
}
function sciipTest21440_StorageDataLakehousePlanningProcessor() {
  var result = sciipRun21440_StorageDataLakehousePlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21440_StorageDataLakehousePlanningProcessor',result:result}));
  return result;
}
