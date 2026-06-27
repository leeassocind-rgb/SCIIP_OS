/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor() {
  const processor =
    '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionLedgerScope',
      'promotionLedgerName',
      'promotionLedgerStatus',
      'promotionLedgerSummary',
      'ledgeredPromotionBusinessKey',
      'promotionResult',
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
      'promotionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const deploymentSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentScope',
      'deploymentName',
      'deploymentStatus',
      'deploymentSummary',
      'deploymentResult',
      'deployedBusinessKey',
      'deployedNodeType',
      'deployedNodeKey',
      'deployedNodeLabel',
      'deployedRelationshipType',
      'deployedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(deploymentSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const promotionResult = sourceRecord.promotionResult || 'PROMOTED';

  const deploymentResult =
    String(promotionResult).toUpperCase() === 'PROMOTED'
      ? 'DEPLOYED'
      : 'NOT_DEPLOYED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.promotionLedgerStatus || sourceRecord.sourceStatus || '',
    promotionResult,
    ledgeredPromotionBusinessKey: sourceRecord.ledgeredPromotionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const deploymentPayload = {
    deploymentType: 'ARCHITECTURE_REVIEW_DEPLOYMENT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourcePromotionLedgerBusinessKey: sourceRecord.businessKey || '',
    promotionResult,
    deploymentResult,
    deployedBusinessKey: sourceRecord.ledgeredPromotionBusinessKey || '',
    deployedNodeType: sourceRecord.ledgeredNodeType || '',
    deployedNodeKey: sourceRecord.ledgeredNodeKey || '',
    deployedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    deployedAt: now.toISOString()
  };

  deploymentSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.promotionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_DEPLOYMENT',
    'SCIIP_OS v5.0 Architecture Review Deployment',
    deploymentResult,
    'Architecture review promotion ledger deployed for downstream SCIIP_OS platform evolution.',
    deploymentResult,
    sourceRecord.ledgeredPromotionBusinessKey || '',
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
    JSON.stringify(deploymentPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
      result
    })
  );

  return result;
}