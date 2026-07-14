function sciipRun21430_StorageDataLakehouseRiskAnalysisProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21430,processorName:'StorageDataLakehouseRiskAnalysis',statusField:'storageDataLakehouseRiskAnalysisStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_DATA_LAKEHOUSE_RISK_ANALYSIS',nextAction:'Run 21440_StorageDataLakehousePlanningProcessor after this processor completes.'});
}
function sciipTest21430_StorageDataLakehouseRiskAnalysisProcessor() {
  var result = sciipRun21430_StorageDataLakehouseRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21430_StorageDataLakehouseRiskAnalysisProcessor',result:result}));
  return result;
}
