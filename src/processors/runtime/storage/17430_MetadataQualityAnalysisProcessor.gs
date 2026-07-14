/**
 * SCIIP_OS v6.0 — 17430 MetadataQualityAnalysis
 */
function sciipRun17430_MetadataQualityAnalysisProcessor() {
  return SCIIP_STORAGE_METADATA_BACKEND.executeMetadataPlan({
    processorNumber: 17430,
    processorName: 'MetadataQualityAnalysis',
    statusField: 'metadataQualityAnalysisStatus',
    component: 'Storage Metadata Execution',
    backendLayer: 'Storage Metadata',
    sourceSheet: 'METADATA_COVERAGE_ASSESSMENT',
    targetSheet: 'METADATA_QUALITY_ANALYSIS',
    nextAction: 'Run 17440_MetadataPlanningProcessor after this processor completes.'
  });
}

function sciipTest17430_MetadataQualityAnalysisProcessor() {
  var result = sciipRun17430_MetadataQualityAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17430_MetadataQualityAnalysisProcessor',
    result: result
  }));
  return result;
}
