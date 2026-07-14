function sciipRun21820_StorageColdTierCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21820,processorName:'StorageColdTierCoverageAssessment',statusField:'storageColdTierCoverageAssessmentStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_POLICY_REGISTRY',targetSheet:'STORAGE_COLD_TIER_COVERAGE_ASSESSMENT',nextAction:'Run 21830_StorageColdTierRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21820_StorageColdTierCoverageAssessmentProcessor() {
  var result = sciipRun21820_StorageColdTierCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21820_StorageColdTierCoverageAssessmentProcessor',result:result}));
  return result;
}
