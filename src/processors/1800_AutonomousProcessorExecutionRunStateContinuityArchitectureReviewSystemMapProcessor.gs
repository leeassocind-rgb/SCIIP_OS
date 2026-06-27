/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor() {
  const processor =
    '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'nodeType',
      'nodeKey',
      'nodeLabel',
      'relationshipType',
      'relationshipTargetKey',
      'architectureReviewScope',
      'architectureReviewName',
      'knowledgeGraphStatus',
      'knowledgeGraphSummary',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'knowledgeGraphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const systemMapSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(systemMapSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 0,
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
    sourceStatus: sourceRecord.knowledgeGraphStatus || sourceRecord.sourceStatus || '',
    nodeType: sourceRecord.nodeType || '',
    nodeKey: sourceRecord.nodeKey || '',
    nodeLabel: sourceRecord.nodeLabel || '',
    relationshipType: sourceRecord.relationshipType || '',
    relationshipTargetKey: sourceRecord.relationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const systemMapPayload = {
    systemMapType: 'ARCHITECTURE_REVIEW_SYSTEM_MAP',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceKnowledgeGraphBusinessKey: sourceRecord.businessKey || '',
    mappedNodeType:
      sourceRecord.nodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    mappedNodeKey:
      sourceRecord.nodeKey || '',
    mappedNodeLabel:
      sourceRecord.nodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    mappedRelationshipType:
      sourceRecord.relationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    mappedRelationshipTargetKey:
      sourceRecord.relationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemMapStatus: 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  systemMapSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.knowledgeGraphStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    'SCIIP_OS v5.0 Architecture Review System Map',
    'ACTIVE',
    'Architecture review knowledge graph node mapped into SCIIP_OS system architecture map.',
    sourceRecord.nodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.nodeKey || '',
    sourceRecord.nodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.relationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.relationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Preserve architecture-review records as graph-ready platform memory for future continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(systemMapPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
      result
    })
  );

  return result;
}