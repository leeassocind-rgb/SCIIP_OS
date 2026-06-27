/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  const processor =
    '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationScope',
      'activationName',
      'activationStatus',
      'activationSummary',
      'activationResult',
      'activatedBusinessKey',
      'activatedNodeType',
      'activatedNodeKey',
      'activatedNodeLabel',
      'activatedRelationshipType',
      'activatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationLedgerScope',
      'activationLedgerName',
      'activationLedgerStatus',
      'activationLedgerSummary',
      'ledgeredActivationBusinessKey',
      'activationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const activationResult = sourceRecord.activationResult || 'ACTIVATED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.activationStatus || sourceRecord.sourceStatus || '',
    activationResult,
    activatedBusinessKey: sourceRecord.activatedBusinessKey || '',
    activatedNodeType: sourceRecord.activatedNodeType || '',
    activatedNodeKey: sourceRecord.activatedNodeKey || '',
    activatedNodeLabel: sourceRecord.activatedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const activationLedgerPayload = {
    activationLedgerType: 'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceActivationBusinessKey: sourceRecord.businessKey || '',
    activationResult,
    ledgeredActivationBusinessKey: sourceRecord.activatedBusinessKey || '',
    ledgeredNodeType: sourceRecord.activatedNodeType || '',
    ledgeredNodeKey: sourceRecord.activatedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.activatedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.activationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Activation Ledger',
    'LEDGERED',
    'Architecture review activation written into permanent activation ledger history.',
    sourceRecord.businessKey || '',
    activationResult,
    sourceRecord.activatedNodeType || '',
    sourceRecord.activatedNodeKey || '',
    sourceRecord.activatedNodeLabel || '',
    sourceRecord.activatedRelationshipType || '',
    sourceRecord.activatedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(activationLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
      result
    })
  );

  return result;
}