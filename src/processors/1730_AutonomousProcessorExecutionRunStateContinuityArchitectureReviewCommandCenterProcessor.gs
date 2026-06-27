/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor() {
  const processor =
    '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureSignalType',
      'architectureSignalSeverity',
      'architectureSignalStatus',
      'architectureSignalSummary',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureDecisionRecordJson',
      'signalPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const commandCenterSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'commandCenterStatus',
      'commandCenterPriority',
      'commandCenterSummary',
      'architectureSignalType',
      'architectureSignalSeverity',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'commandCenterPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(commandCenterSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const signalSeverity =
    sourceRecord.architectureSignalSeverity || 'INFO';

  let commandCenterStatus = 'ACTIVE';
  let commandCenterPriority = 'NORMAL';

  if (String(signalSeverity).toUpperCase() === 'WARN') {
    commandCenterPriority = 'ELEVATED';
  }

  if (
    String(signalSeverity).toUpperCase() === 'ERROR' ||
    String(signalSeverity).toUpperCase() === 'CRITICAL'
  ) {
    commandCenterPriority = 'HIGH';
    commandCenterStatus = 'REVIEW_REQUIRED';
  }

  const commandCenterPayload = {
    commandCenterType: 'ARCHITECTURE_REVIEW_COMMAND_CENTER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceSignalBusinessKey: sourceRecord.businessKey || '',
    architectureSignalType:
      sourceRecord.architectureSignalType || 'ARCHITECTURE_REVIEW_HEALTHY',
    architectureSignalSeverity: signalSeverity,
    architectureSignalStatus:
      sourceRecord.architectureSignalStatus || sourceRecord.sourceStatus || '',
    commandCenterStatus,
    commandCenterPriority,
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    humanReviewRequired:
      sourceRecord.humanReviewRequired || 'FALSE',
    autonomousActionAllowed:
      sourceRecord.autonomousActionAllowed || 'TRUE',
    createdAt: now.toISOString()
  };

  commandCenterSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.architectureSignalStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Command Center',
    commandCenterStatus,
    commandCenterPriority,
    'Architecture review command center updated from latest architecture review signal.',
    sourceRecord.architectureSignalType || 'ARCHITECTURE_REVIEW_HEALTHY',
    signalSeverity,
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(commandCenterPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
      result
    })
  );

  return result;
}