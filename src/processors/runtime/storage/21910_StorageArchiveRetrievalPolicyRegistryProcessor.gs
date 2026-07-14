function sciipRun21910_StorageArchiveRetrievalPolicyRegistryProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21910,processorName:'StorageArchiveRetrievalPolicyRegistry',statusField:'storageArchiveRetrievalPolicyRegistryStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_READINESS',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_POLICY_REGISTRY',nextAction:'Run 21920_StorageArchiveRetrievalCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21910_StorageArchiveRetrievalPolicyRegistryProcessor() {
  var result = sciipRun21910_StorageArchiveRetrievalPolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21910_StorageArchiveRetrievalPolicyRegistryProcessor',result:result}));
  return result;
}
