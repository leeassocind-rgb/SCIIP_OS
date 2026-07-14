function sciipRun21420_StorageDataLakehouseCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21420,processorName:'StorageDataLakehouseCoverageAssessment',statusField:'storageDataLakehouseCoverageAssessmentStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_POLICY_REGISTRY',targetSheet:'STORAGE_DATA_LAKEHOUSE_COVERAGE_ASSESSMENT',nextAction:'Run 21430_StorageDataLakehouseRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21420_StorageDataLakehouseCoverageAssessmentProcessor() {
  var result = sciipRun21420_StorageDataLakehouseCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21420_StorageDataLakehouseCoverageAssessmentProcessor',result:result}));
  return result;
}
