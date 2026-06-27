/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor() {
  const processor =
    '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'dailyBriefStatus',
      'dailyBriefPriority',
      'dailyBriefTitle',
      'dailyBriefSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'dailyBriefPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const finalizationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'finalizationStatus',
      'finalizationPriority',
      'finalizationSummary',
      'finalizedArchitectureFinding',
      'finalizedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'finalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(finalizationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const finalizedArchitectureFinding =
    sourceRecord.keyArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const finalizedRecommendation =
    sourceRecord.recommendedAction ||
    'Continue Architecture Review Track and preserve all architecture-review outputs as permanent platform memory.';

  const finalizationPayload = {
    finalizationType: 'ARCHITECTURE_REVIEW_FINALIZATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDailyBriefBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    dailyBriefStatus:
      sourceRecord.dailyBriefStatus || sourceRecord.sourceStatus || '',
    dailyBriefPriority:
      sourceRecord.dailyBriefPriority || 'NORMAL',
    finalizationStatus: 'FINALIZED',
    finalizedArchitectureFinding,
    finalizedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    finalizedAt: now.toISOString()
  };

  finalizationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dailyBriefStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Finalization',
    'FINALIZED',
    sourceRecord.dailyBriefPriority || 'NORMAL',
    'Architecture review daily brief finalized into permanent architecture-review finalization history.',
    finalizedArchitectureFinding,
    finalizedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(finalizationPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
      result
    })
  );

  return result;
}