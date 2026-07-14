/**
 * SCIIP_OS v6.0 — 18020 PurgeCandidateAssessment
 */
function sciipRun18020_PurgeCandidateAssessmentProcessor() {
  return SCIIP_STORAGE_PURGE_BACKEND.executePurgePlan({
    processorNumber: 18020,
    processorName: 'PurgeCandidateAssessment',
    statusField: 'purgeCandidateAssessmentStatus',
    component: 'Storage Purge Execution',
    backendLayer: 'Storage Purge',
    sourceSheet: 'PURGE_POLICY_REGISTRY',
    targetSheet: 'PURGE_CANDIDATE_ASSESSMENT',
    nextAction: 'Run 18030_DeletionRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest18020_PurgeCandidateAssessmentProcessor() {
  var result = sciipRun18020_PurgeCandidateAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18020_PurgeCandidateAssessmentProcessor',
    result: result
  }));
  return result;
}
