/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  const processor =
    '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionLedgerScope',
      'completionLedgerName',
      'completionLedgerStatus',
      'completionLedgerSummary',
      'ledgeredCompletionBusinessKey',
      'completionResult',
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
      'completionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const handoffSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(handoffSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const completionResult = sourceRecord.completionResult || 'COMPLETED';

  const handoffResult =
    String(completionResult).toUpperCase() === 'COMPLETED'
      ? 'HANDOFF_READY'
      : 'HANDOFF_BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    completionResult,
    ledgeredCompletionBusinessKey:
      sourceRecord.ledgeredCompletionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffPayload = {
    handoffType: 'ARCHITECTURE_REVIEW_HANDOFF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCompletionLedgerBusinessKey: sourceRecord.businessKey || '',
    completionResult,
    handoffResult,
    handoffBusinessKey: sourceRecord.ledgeredCompletionBusinessKey || '',
    handoffNodeType: sourceRecord.ledgeredNodeType || '',
    handoffNodeKey: sourceRecord.ledgeredNodeKey || '',
    handoffNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    nextTrackRecommendation:
      'Begin framework abstraction review for repeated Architecture Review Track processor patterns.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    handedOffAt: now.toISOString()
  };

  handoffSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF',
    'SCIIP_OS v5.0 Architecture Review Handoff',
    handoffResult,
    'Architecture review completion ledger prepared for downstream handoff.',
    handoffResult,
    sourceRecord.ledgeredCompletionBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
      result
    })
  );

  return result;
}