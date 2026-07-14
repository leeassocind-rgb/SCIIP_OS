function sciipRun22010_StorageGeoReplicationPolicyRegistryProcessor() {
  return SCIIP_STORAGE_GEO_REPLICATION_BACKEND.executeGeoReplicationPlan({processorNumber:22010,processorName:'StorageGeoReplicationPolicyRegistry',statusField:'storageGeoReplicationPolicyRegistryStatus',component:'Storage Geo Replication Execution',backendLayer:'Storage Geo Replication',sourceSheet:'STORAGE_GEO_REPLICATION_READINESS',targetSheet:'STORAGE_GEO_REPLICATION_POLICY_REGISTRY',nextAction:'Run 22020_StorageGeoReplicationCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest22010_StorageGeoReplicationPolicyRegistryProcessor() {
  var result = sciipRun22010_StorageGeoReplicationPolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest22010_StorageGeoReplicationPolicyRegistryProcessor',result:result}));
  return result;
}
