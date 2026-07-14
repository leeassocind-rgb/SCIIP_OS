function sciipRun22040_StorageGeoReplicationPlanningProcessor() {
  return SCIIP_STORAGE_GEO_REPLICATION_BACKEND.executeGeoReplicationPlan({processorNumber:22040,processorName:'StorageGeoReplicationPlanning',statusField:'storageGeoReplicationPlanningStatus',component:'Storage Geo Replication Execution',backendLayer:'Storage Geo Replication',sourceSheet:'STORAGE_GEO_REPLICATION_RISK_ANALYSIS',targetSheet:'STORAGE_GEO_REPLICATION_PLANNING',nextAction:'Run 22050_StorageGeoReplicationExecutionProcessor after this processor completes.'});
}
function sciipTest22040_StorageGeoReplicationPlanningProcessor() {
  var result = sciipRun22040_StorageGeoReplicationPlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest22040_StorageGeoReplicationPlanningProcessor',result:result}));
  return result;
}
