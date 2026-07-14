function sciipRun22070_StorageGeoReplicationValidationProcessor() {
  return SCIIP_STORAGE_GEO_REPLICATION_BACKEND.executeGeoReplicationPlan({processorNumber:22070,processorName:'StorageGeoReplicationValidation',statusField:'storageGeoReplicationValidationStatus',component:'Storage Geo Replication Execution',backendLayer:'Storage Geo Replication',sourceSheet:'STORAGE_GEO_REPLICATION_LEDGER',targetSheet:'STORAGE_GEO_REPLICATION_VALIDATION',nextAction:'Run 22080_StorageGeoReplicationCertificationProcessor after this processor completes.'});
}
function sciipTest22070_StorageGeoReplicationValidationProcessor() {
  var result = sciipRun22070_StorageGeoReplicationValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest22070_StorageGeoReplicationValidationProcessor',result:result}));
  return result;
}
