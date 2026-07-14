/**
 * SCIIP_OS v6.0 — 17920 ArchiveCandidateAssessment
 */
function sciipRun17920_ArchiveCandidateAssessmentProcessor() {
  return SCIIP_STORAGE_ARCHIVAL_BACKEND.executeArchivalPlan({
    processorNumber: 17920,
    processorName: 'ArchiveCandidateAssessment',
    statusField: 'archiveCandidateAssessmentStatus',
    component: 'Storage Archival Execution',
    backendLayer: 'Storage Archival',
    sourceSheet: 'ARCHIVAL_POLICY_REGISTRY',
    targetSheet: 'ARCHIVE_CANDIDATE_ASSESSMENT',
    nextAction: 'Run 17930_ArchiveRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest17920_ArchiveCandidateAssessmentProcessor() {
  var result = sciipRun17920_ArchiveCandidateAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest17920_ArchiveCandidateAssessmentProcessor',
    result: result
  }));
  return result;
}
