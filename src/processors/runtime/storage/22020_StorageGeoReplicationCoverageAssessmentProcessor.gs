function sciipRun22020_StorageGeoReplicationCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_GEO_REPLICATION_BACKEND.executeGeoReplicationPlan({processorNumber:22020,processorName:'StorageGeoReplicationCoverageAssessment',statusField:'storageGeoReplicationCoverageAssessmentStatus',component:'Storage Geo Replication Execution',backendLayer:'Storage Geo Replication',sourceSheet:'STORAGE_GEO_REPLICATION_POLICY_REGISTRY',targetSheet:'STORAGE_GEO_REPLICATION_COVERAGE_ASSESSMENT',nextAction:'Run 22030_StorageGeoReplicationRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest22020_StorageGeoReplicationCoverageAssessmentProcessor() {
  var result = sciipRun22020_StorageGeoReplicationCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest22020_StorageGeoReplicationCoverageAssessmentProcessor',result:result}));
  return result;
}
