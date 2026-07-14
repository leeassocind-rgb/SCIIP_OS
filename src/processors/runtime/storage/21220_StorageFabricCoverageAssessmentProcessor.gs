function sciipRun21220_StorageFabricCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21220,processorName:'StorageFabricCoverageAssessment',statusField:'storageFabricCoverageAssessmentStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_POLICY_REGISTRY',targetSheet:'STORAGE_FABRIC_COVERAGE_ASSESSMENT',nextAction:'Run 21230_StorageFabricRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21220_StorageFabricCoverageAssessmentProcessor() {
  var result = sciipRun21220_StorageFabricCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21220_StorageFabricCoverageAssessmentProcessor',result:result}));
  return result;
}
