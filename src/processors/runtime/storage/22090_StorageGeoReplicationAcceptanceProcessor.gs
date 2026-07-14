function sciipRun22090_StorageGeoReplicationAcceptanceProcessor() {
  return SCIIP_STORAGE_GEO_REPLICATION_BACKEND.executeGeoReplicationPlan({processorNumber:22090,processorName:'StorageGeoReplicationAcceptance',statusField:'storageGeoReplicationAcceptanceStatus',component:'Storage Geo Replication Execution',backendLayer:'Storage Geo Replication',sourceSheet:'STORAGE_GEO_REPLICATION_CERTIFICATION',targetSheet:'STORAGE_GEO_REPLICATION_ACCEPTANCE',nextAction:'Storage Geo Replication Execution accepted through 22090.'});
}
function sciipTest22090_StorageGeoReplicationAcceptanceProcessor() {
  var result = sciipRun22090_StorageGeoReplicationAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest22090_StorageGeoReplicationAcceptanceProcessor',result:result}));
  return result;
}
