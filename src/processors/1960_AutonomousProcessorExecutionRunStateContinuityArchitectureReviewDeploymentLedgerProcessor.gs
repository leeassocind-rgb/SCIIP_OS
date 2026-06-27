/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor() {
  const processor =
    '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentLedgerScope',
      'deploymentLedgerName',
      'deploymentLedgerStatus',
      'deploymentLedgerSummary',
      'ledgeredDeploymentBusinessKey',
      'deploymentResult',
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
      'deploymentLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const deploymentResult = sourceRecord.deploymentResult || 'DEPLOYED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.deploymentStatus || sourceRecord.sourceStatus || '',
    deploymentResult,
    deployedBusinessKey: sourceRecord.deployedBusinessKey || '',
    deployedNodeType: sourceRecord.deployedNodeType || '',
    deployedNodeKey: sourceRecord.deployedNodeKey || '',
    deployedNodeLabel: sourceRecord.deployedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const deploymentLedgerPayload = {
    deploymentLedgerType: 'ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDeploymentBusinessKey: sourceRecord.businessKey || '',
    deploymentResult,
    ledgeredDeploymentBusinessKey: sourceRecord.deployedBusinessKey || '',
    ledgeredNodeType: sourceRecord.deployedNodeType || '',
    ledgeredNodeKey: sourceRecord.deployedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.deployedNodeLabel || '',
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
    sourceRecord.deploymentStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Deployment Ledger',
    'LEDGERED',
    'Architecture review deployment written into permanent deployment ledger history.',
    sourceRecord.businessKey || '',
    deploymentResult,
    sourceRecord.deployedNodeType || '',
    sourceRecord.deployedNodeKey || '',
    sourceRecord.deployedNodeLabel || '',
    sourceRecord.deployedRelationshipType || '',
    sourceRecord.deployedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(deploymentLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
      result
    })
  );

  return result;
}