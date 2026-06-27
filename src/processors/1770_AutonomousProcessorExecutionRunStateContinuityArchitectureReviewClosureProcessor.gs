/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor() {
  const processor =
    '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const closureSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(closureSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const closedArchitectureFinding =
    sourceRecord.finalizedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const closedRecommendation =
    sourceRecord.finalizedRecommendation ||
    'Preserve architecture-review outputs as permanent platform memory and make them available to downstream continuity processors.';

  const closurePayload = {
    closureType: 'ARCHITECTURE_REVIEW_CLOSURE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceFinalizationBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    finalizationStatus:
      sourceRecord.finalizationStatus || sourceRecord.sourceStatus || '',
    finalizationPriority:
      sourceRecord.finalizationPriority || 'NORMAL',
    closureStatus: 'CLOSED',
    closedArchitectureFinding,
    closedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    closedAt: now.toISOString()
  };

  closureSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.finalizationStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Closure',
    'CLOSED',
    sourceRecord.finalizationPriority || 'NORMAL',
    'Architecture review finalization closed into permanent architecture-review closure history.',
    closedArchitectureFinding,
    closedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(closurePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
      result
    })
  );

  return result;
}