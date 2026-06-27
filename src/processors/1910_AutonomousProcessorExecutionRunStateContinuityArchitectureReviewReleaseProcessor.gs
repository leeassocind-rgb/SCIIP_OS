/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor() {
  const processor =
    '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'certificationScope',
      'certificationName',
      'certificationStatus',
      'certificationSummary',
      'certificationResult',
      'certifiedBusinessKey',
      'certifiedNodeType',
      'certifiedNodeKey',
      'certifiedNodeLabel',
      'certifiedRelationshipType',
      'certifiedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'certificationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const releaseSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseScope',
      'releaseName',
      'releaseStatus',
      'releaseSummary',
      'releaseResult',
      'releasedBusinessKey',
      'releasedNodeType',
      'releasedNodeKey',
      'releasedNodeLabel',
      'releasedRelationshipType',
      'releasedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releasePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(releaseSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const certificationResult = sourceRecord.certificationResult || 'CERTIFIED';
  const releaseResult =
    String(certificationResult).toUpperCase() === 'CERTIFIED'
      ? 'RELEASED'
      : 'BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.certificationStatus || sourceRecord.sourceStatus || '',
    certificationResult,
    certifiedBusinessKey: sourceRecord.certifiedBusinessKey || '',
    certifiedNodeType: sourceRecord.certifiedNodeType || '',
    certifiedNodeKey: sourceRecord.certifiedNodeKey || '',
    certifiedNodeLabel: sourceRecord.certifiedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const releasePayload = {
    releaseType: 'ARCHITECTURE_REVIEW_RELEASE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCertificationBusinessKey: sourceRecord.businessKey || '',
    certificationResult,
    releaseResult,
    releasedBusinessKey: sourceRecord.certifiedBusinessKey || '',
    releasedNodeType: sourceRecord.certifiedNodeType || '',
    releasedNodeKey: sourceRecord.certifiedNodeKey || '',
    releasedNodeLabel: sourceRecord.certifiedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    releasedAt: now.toISOString()
  };

  releaseSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.certificationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_RELEASE',
    'SCIIP_OS v5.0 Architecture Review Release',
    releaseResult,
    'Certified architecture-review output released for downstream platform evolution.',
    releaseResult,
    sourceRecord.certifiedBusinessKey || '',
    sourceRecord.certifiedNodeType || '',
    sourceRecord.certifiedNodeKey || '',
    sourceRecord.certifiedNodeLabel || '',
    sourceRecord.certifiedRelationshipType || '',
    sourceRecord.certifiedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(releasePayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
      result
    })
  );

  return result;
}