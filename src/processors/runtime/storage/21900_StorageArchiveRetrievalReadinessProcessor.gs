function sciipRun21900_StorageArchiveRetrievalReadinessProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21900,processorName:'StorageArchiveRetrievalReadiness',statusField:'storageArchiveRetrievalReadinessStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'COLD_TIER_ACCEPTANCES',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_READINESS',nextAction:'Run 21910_StorageArchiveRetrievalPolicyRegistryProcessor after this processor completes.'});
}
function sciipTest21900_StorageArchiveRetrievalReadinessProcessor() {
  var result = sciipRun21900_StorageArchiveRetrievalReadinessProcessor();
  console.log(JSON.stringify({test:'sciipTest21900_StorageArchiveRetrievalReadinessProcessor',result:result}));
  return result;
}
