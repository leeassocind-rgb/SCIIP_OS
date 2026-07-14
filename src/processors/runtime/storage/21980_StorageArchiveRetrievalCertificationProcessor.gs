function sciipRun21980_StorageArchiveRetrievalCertificationProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21980,processorName:'StorageArchiveRetrievalCertification',statusField:'storageArchiveRetrievalCertificationStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_VALIDATION',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_CERTIFICATION',nextAction:'Run 21990_StorageArchiveRetrievalAcceptanceProcessor after this processor completes.'});
}
function sciipTest21980_StorageArchiveRetrievalCertificationProcessor() {
  var result = sciipRun21980_StorageArchiveRetrievalCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21980_StorageArchiveRetrievalCertificationProcessor',result:result}));
  return result;
}
