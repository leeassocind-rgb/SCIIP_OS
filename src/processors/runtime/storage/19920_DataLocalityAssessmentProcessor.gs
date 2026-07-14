/**
 * SCIIP_OS v6.0 — 19920 DataLocalityAssessment
 */
function sciipRun19920_DataLocalityAssessmentProcessor() {
  return SCIIP_STORAGE_LOCALITY_BACKEND.executeLocalityPlan({
    processorNumber: 19920,
    processorName: 'DataLocalityAssessment',
    statusField: 'dataLocalityAssessmentStatus',
    component: 'Storage Locality Execution',
    backendLayer: 'Storage Locality',
    sourceSheet: 'LOCALITY_POLICY_REGISTRY',
    targetSheet: 'DATA_LOCALITY_ASSESSMENT',
    nextAction: 'Run 19930_LatencyDistanceAnalysisProcessor after this processor completes.'
  });
}

function sciipTest19920_DataLocalityAssessmentProcessor() {
  var result = sciipRun19920_DataLocalityAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest19920_DataLocalityAssessmentProcessor',
    result: result
  }));
  return result;
}
