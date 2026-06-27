/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor() {
  const processor =
    '1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const registrySheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'registeredSystemIndexBusinessKey',
      'registeredNodeType',
      'registeredNodeKey',
      'registeredNodeLabel',
      'registeredRelationshipType',
      'registeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemRegistryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(registrySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistriesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistriesCreated: 0,
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
    sourceStatus: sourceRecord.systemIndexStatus || sourceRecord.sourceStatus || '',
    systemIndexScope: sourceRecord.systemIndexScope || '',
    systemIndexName: sourceRecord.systemIndexName || '',
    indexedNodeType: sourceRecord.indexedNodeType || '',
    indexedNodeKey: sourceRecord.indexedNodeKey || '',
    indexedNodeLabel: sourceRecord.indexedNodeLabel || '',
    indexedRelationshipType: sourceRecord.indexedRelationshipType || '',
    indexedRelationshipTargetKey: sourceRecord.indexedRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const registryPayload = {
    systemRegistryType: 'ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemIndexBusinessKey: sourceRecord.businessKey || '',
    registeredNodeType:
      sourceRecord.indexedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    registeredNodeKey:
      sourceRecord.indexedNodeKey || '',
    registeredNodeLabel:
      sourceRecord.indexedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    registeredRelationshipType:
      sourceRecord.indexedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    registeredRelationshipTargetKey:
      sourceRecord.indexedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemRegistryStatus: 'REGISTERED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  registrySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemIndexStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    'SCIIP_OS v5.0 Architecture Review System Registry',
    'REGISTERED',
    'Architecture review system index registered into SCIIP_OS architecture review system registry.',
    sourceRecord.businessKey || '',
    sourceRecord.indexedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.indexedNodeKey || '',
    sourceRecord.indexedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.indexedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.indexedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Register architecture-review memory for downstream continuity and autonomous planning processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(registryPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor',
      result
    })
  );

  return result;
}