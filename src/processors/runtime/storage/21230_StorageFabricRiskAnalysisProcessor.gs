function sciipRun21230_StorageFabricRiskAnalysisProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21230,processorName:'StorageFabricRiskAnalysis',statusField:'storageFabricRiskAnalysisStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_FABRIC_RISK_ANALYSIS',nextAction:'Run 21240_StorageFabricPlanningProcessor after this processor completes.'});
}
function sciipTest21230_StorageFabricRiskAnalysisProcessor() {
  var result = sciipRun21230_StorageFabricRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21230_StorageFabricRiskAnalysisProcessor',result:result}));
  return result;
}
