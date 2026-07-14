function sciipRun21830_StorageColdTierRiskAnalysisProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21830,processorName:'StorageColdTierRiskAnalysis',statusField:'storageColdTierRiskAnalysisStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_COLD_TIER_RISK_ANALYSIS',nextAction:'Run 21840_StorageColdTierPlanningProcessor after this processor completes.'});
}
function sciipTest21830_StorageColdTierRiskAnalysisProcessor() {
  var result = sciipRun21830_StorageColdTierRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21830_StorageColdTierRiskAnalysisProcessor',result:result}));
  return result;
}
