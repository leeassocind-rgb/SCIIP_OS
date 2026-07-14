function sciipRun22030_StorageGeoReplicationRiskAnalysisProcessor() {
  return SCIIP_STORAGE_GEO_REPLICATION_BACKEND.executeGeoReplicationPlan({processorNumber:22030,processorName:'StorageGeoReplicationRiskAnalysis',statusField:'storageGeoReplicationRiskAnalysisStatus',component:'Storage Geo Replication Execution',backendLayer:'Storage Geo Replication',sourceSheet:'STORAGE_GEO_REPLICATION_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_GEO_REPLICATION_RISK_ANALYSIS',nextAction:'Run 22040_StorageGeoReplicationPlanningProcessor after this processor completes.'});
}
function sciipTest22030_StorageGeoReplicationRiskAnalysisProcessor() {
  var result = sciipRun22030_StorageGeoReplicationRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest22030_StorageGeoReplicationRiskAnalysisProcessor',result:result}));
  return result;
}
