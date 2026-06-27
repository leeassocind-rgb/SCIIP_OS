/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor() {
  const processor =
    '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseLedgerScope',
      'releaseLedgerName',
      'releaseLedgerStatus',
      'releaseLedgerSummary',
      'ledgeredReleaseBusinessKey',
      'releaseResult',
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
      'releaseLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const promotionSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionScope',
      'promotionName',
      'promotionStatus',
      'promotionSummary',
      'promotionResult',
      'promotedBusinessKey',
      'promotedNodeType',
      'promotedNodeKey',
      'promotedNodeLabel',
      'promotedRelationshipType',
      'promotedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(promotionSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const releaseResult = sourceRecord.releaseResult || 'RELEASED';
  const promotionResult =
    String(releaseResult).toUpperCase() === 'RELEASED'
      ? 'PROMOTED'
      : 'NOT_PROMOTED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.releaseLedgerStatus || sourceRecord.sourceStatus || '',
    releaseResult,
    ledgeredReleaseBusinessKey: sourceRecord.ledgeredReleaseBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const promotionPayload = {
    promotionType: 'ARCHITECTURE_REVIEW_PROMOTION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReleaseLedgerBusinessKey: sourceRecord.businessKey || '',
    releaseResult,
    promotionResult,
    promotedBusinessKey: sourceRecord.ledgeredReleaseBusinessKey || '',
    promotedNodeType: sourceRecord.ledgeredNodeType || '',
    promotedNodeKey: sourceRecord.ledgeredNodeKey || '',
    promotedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    promotedAt: now.toISOString()
  };

  promotionSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.releaseLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_PROMOTION',
    'SCIIP_OS v5.0 Architecture Review Promotion',
    promotionResult,
    'Architecture review release ledger promoted for downstream autonomous platform evolution.',
    promotionResult,
    sourceRecord.ledgeredReleaseBusinessKey || '',
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
    JSON.stringify(promotionPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
      result
    })
  );

  return result;
}