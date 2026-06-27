/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor() {
  const processor =
    '1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'stateSourceRegistryBusinessKey',
      'stateNodeType',
      'stateNodeKey',
      'stateNodeLabel',
      'stateRelationshipType',
      'stateRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemStatePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'snapshotSummary',
      'snapshotSourceStateBusinessKey',
      'snapshotNodeType',
      'snapshotNodeKey',
      'snapshotNodeLabel',
      'snapshotRelationshipType',
      'snapshotRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.systemStateStatus || sourceRecord.sourceStatus || '',
    systemStateScope: sourceRecord.systemStateScope || '',
    systemStateName: sourceRecord.systemStateName || '',
    stateNodeType: sourceRecord.stateNodeType || '',
    stateNodeKey: sourceRecord.stateNodeKey || '',
    stateNodeLabel: sourceRecord.stateNodeLabel || '',
    stateRelationshipType: sourceRecord.stateRelationshipType || '',
    stateRelationshipTargetKey: sourceRecord.stateRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const snapshotPayload = {
    snapshotType: 'ARCHITECTURE_REVIEW_SNAPSHOT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemStateBusinessKey: sourceRecord.businessKey || '',
    snapshotNodeType:
      sourceRecord.stateNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    snapshotNodeKey:
      sourceRecord.stateNodeKey || '',
    snapshotNodeLabel:
      sourceRecord.stateNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    snapshotRelationshipType:
      sourceRecord.stateRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    snapshotRelationshipTargetKey:
      sourceRecord.stateRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    snapshotStatus: 'CAPTURED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    capturedAt: now.toISOString()
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemStateStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SNAPSHOT',
    'SCIIP_OS v5.0 Architecture Review Snapshot',
    'CAPTURED',
    'Current architecture review system state captured as a permanent architecture-review snapshot.',
    sourceRecord.businessKey || '',
    sourceRecord.stateNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.stateNodeKey || '',
    sourceRecord.stateNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.stateRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.stateRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Use captured architecture-review snapshots as stable references for downstream continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(snapshotPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor',
      result
    })
  );

  return result;
}