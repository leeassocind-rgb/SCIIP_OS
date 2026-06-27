/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor() {
  const processor =
    '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'closureStatus',
      'closurePriority',
      'closureSummary',
      'closedArchitectureFinding',
      'closedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'closurePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const archiveSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'archiveStatus',
      'archivePriority',
      'archiveSummary',
      'archivedArchitectureFinding',
      'archivedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'archivePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(archiveSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const archivedArchitectureFinding =
    sourceRecord.closedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const archivedRecommendation =
    sourceRecord.closedRecommendation ||
    'Archive architecture-review closure outputs as permanent platform memory for future continuity and autonomous planning.';

  const archivePayload = {
    archiveType: 'ARCHITECTURE_REVIEW_ARCHIVE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceClosureBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    closureStatus:
      sourceRecord.closureStatus || sourceRecord.sourceStatus || '',
    closurePriority:
      sourceRecord.closurePriority || 'NORMAL',
    archiveStatus: 'ARCHIVED',
    archivedArchitectureFinding,
    archivedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    archivedAt: now.toISOString()
  };

  archiveSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.closureStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Archive',
    'ARCHIVED',
    sourceRecord.closurePriority || 'NORMAL',
    'Architecture review closure archived into permanent architecture-review archive history.',
    archivedArchitectureFinding,
    archivedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(archivePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
      result
    })
  );

  return result;
}