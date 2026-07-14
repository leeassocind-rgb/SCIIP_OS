function sciipRun21990_StorageArchiveRetrievalAcceptanceProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21990,processorName:'StorageArchiveRetrievalAcceptance',statusField:'storageArchiveRetrievalAcceptanceStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_CERTIFICATION',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_ACCEPTANCE',nextAction:'Storage Archive Retrieval Execution accepted through 21990.'});
}
function sciipTest21990_StorageArchiveRetrievalAcceptanceProcessor() {
  var result = sciipRun21990_StorageArchiveRetrievalAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest21990_StorageArchiveRetrievalAcceptanceProcessor',result:result}));
  return result;
}
