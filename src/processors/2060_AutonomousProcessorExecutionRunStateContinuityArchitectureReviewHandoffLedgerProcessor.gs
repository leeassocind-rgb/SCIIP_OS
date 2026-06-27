/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  const processor =
    '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffScope',
      'handoffName',
      'handoffStatus',
      'handoffSummary',
      'handoffResult',
      'handoffBusinessKey',
      'handoffNodeType',
      'handoffNodeKey',
      'handoffNodeLabel',
      'handoffRelationshipType',
      'handoffRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffLedgerScope',
      'handoffLedgerName',
      'handoffLedgerStatus',
      'handoffLedgerSummary',
      'ledgeredHandoffBusinessKey',
      'handoffResult',
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
      'handoffLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const handoffResult = sourceRecord.handoffResult || 'HANDOFF_READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    handoffResult,
    handoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    handoffNodeType: sourceRecord.handoffNodeType || '',
    handoffNodeKey: sourceRecord.handoffNodeKey || '',
    handoffNodeLabel: sourceRecord.handoffNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffLedgerPayload = {
    handoffLedgerType: 'ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceHandoffBusinessKey: sourceRecord.businessKey || '',
    handoffResult,
    ledgeredHandoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    ledgeredNodeType: sourceRecord.handoffNodeType || '',
    ledgeredNodeKey: sourceRecord.handoffNodeKey || '',
    ledgeredNodeLabel: sourceRecord.handoffNodeLabel || '',
    nextTrackRecommendation:
      'Proceed to reusable Architecture Review processor framework analysis after final handoff ledger.',
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
    sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Handoff Ledger',
    'LEDGERED',
    'Architecture review handoff written into permanent handoff ledger history.',
    sourceRecord.businessKey || '',
    handoffResult,
    sourceRecord.handoffNodeType || '',
    sourceRecord.handoffNodeKey || '',
    sourceRecord.handoffNodeLabel || '',
    sourceRecord.handoffRelationshipType || '',
    sourceRecord.handoffRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
      result
    })
  );

  return result;
}