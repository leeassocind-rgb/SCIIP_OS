/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor() {
  const processor =
    '1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMapScope',
      'systemMapName',
      'systemMapStatus',
      'systemMapSummary',
      'mappedNodeType',
      'mappedNodeKey',
      'mappedNodeLabel',
      'mappedRelationshipType',
      'mappedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemMapPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'systemIndexSummary',
      'indexedSystemMapBusinessKey',
      'indexedNodeType',
      'indexedNodeKey',
      'indexedNodeLabel',
      'indexedRelationshipType',
      'indexedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemIndexPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEX|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexesCreated: 0,
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
    sourceStatus: sourceRecord.systemMapStatus || sourceRecord.sourceStatus || '',
    systemMapScope: sourceRecord.systemMapScope || '',
    systemMapName: sourceRecord.systemMapName || '',
    mappedNodeType: sourceRecord.mappedNodeType || '',
    mappedNodeKey: sourceRecord.mappedNodeKey || '',
    mappedNodeLabel: sourceRecord.mappedNodeLabel || '',
    mappedRelationshipType: sourceRecord.mappedRelationshipType || '',
    mappedRelationshipTargetKey: sourceRecord.mappedRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const systemIndexPayload = {
    systemIndexType: 'ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemMapBusinessKey: sourceRecord.businessKey || '',
    indexedNodeType:
      sourceRecord.mappedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    indexedNodeKey:
      sourceRecord.mappedNodeKey || '',
    indexedNodeLabel:
      sourceRecord.mappedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    indexedRelationshipType:
      sourceRecord.mappedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    indexedRelationshipTargetKey:
      sourceRecord.mappedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemIndexStatus: 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemMapStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    'SCIIP_OS v5.0 Architecture Review System Index',
    'ACTIVE',
    'Architecture review system map indexed into SCIIP_OS architecture review system index.',
    sourceRecord.businessKey || '',
    sourceRecord.mappedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.mappedNodeKey || '',
    sourceRecord.mappedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.mappedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.mappedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Preserve architecture-review records as indexed platform memory for future continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(systemIndexPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor',
      result
    })
  );

  return result;
}