/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor() {
  const processor =
    '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureLedgerStatus',
      'architectureLedgerSummary',
      'architectureDecisionRecordJson',
      'architectureReviewPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const signalSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(signalSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  let signalType = 'ARCHITECTURE_REVIEW_HEALTHY';
  let severity = 'INFO';
  let signalStatus = 'SUCCESS';
  let recommendedAction =
    'Continue Architecture Review Track. Use ledger entries as durable architectural memory.';
  let humanReviewRequired = 'FALSE';
  let autonomousActionAllowed = 'TRUE';

  const ledgerStatus =
    sourceRecord.architectureLedgerStatus ||
    sourceRecord.architectureReviewStatus ||
    sourceRecord.sourceStatus ||
    '';

  if (String(ledgerStatus).toUpperCase() === 'REVIEW_REQUIRED') {
    signalType = 'ARCHITECTURE_REVIEW_REVIEW_REQUIRED';
    severity = 'WARN';
    signalStatus = 'REVIEW_REQUIRED';
    recommendedAction =
      'Review architecture ledger entry before downstream architecture-review promotion.';
    humanReviewRequired = 'TRUE';
    autonomousActionAllowed = 'FALSE';
  }

  const signalPayload = {
    signalType,
    severity,
    signalStatus,
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architectureReviewPhase:
      sourceRecord.architectureReviewPhase || 'LEDGER',
    architectureLedgerStatus:
      sourceRecord.architectureLedgerStatus || 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    emittedAt: now.toISOString()
  };

  signalSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    ledgerStatus,
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Signal',
    signalType,
    severity,
    signalStatus,
    'Architecture review signal emitted from latest permanent architecture review ledger entry.',
    recommendedAction,
    humanReviewRequired,
    autonomousActionAllowed,
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    sourceRecord.architectureDecisionRecordJson || '',
    JSON.stringify(signalPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
      result
    })
  );

  return result;
}