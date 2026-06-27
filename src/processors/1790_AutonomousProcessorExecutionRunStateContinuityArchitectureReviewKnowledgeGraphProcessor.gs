/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor() {
  const processor =
    '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'archiveStatus',
      'archivePriority',
      'archiveSummary',
      'archivedArchitectureFinding',
      'archivedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'archivePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const kgSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(kgSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const nodeType = 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE';

  const nodeKey =
    'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE|' +
    dateKey +
    '|SCIIP_OS_V5_ARCHITECTURE_MEMORY';

  const architectureFinding =
    sourceRecord.archivedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const architectureRecommendation =
    sourceRecord.archivedRecommendation ||
    'Preserve architecture-review records as permanent graph-ready platform memory for future continuity processors.';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.archiveStatus || sourceRecord.sourceStatus || '',
    architectureReviewScope: sourceRecord.architectureReviewScope || '',
    architectureReviewName: sourceRecord.architectureReviewName || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const knowledgeGraphPayload = {
    knowledgeGraphType: 'ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceArchiveBusinessKey: sourceRecord.businessKey || '',
    nodeType,
    nodeKey,
    nodeLabel: 'SCIIP_OS v5.0 Architecture Review Memory',
    relationshipType: 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    relationshipTargetKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    architectureFinding,
    architectureRecommendation,
    knowledgeGraphStatus: 'ACTIVE',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  kgSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.archiveStatus || sourceRecord.sourceStatus || '',
    nodeType,
    nodeKey,
    'SCIIP_OS v5.0 Architecture Review Memory',
    'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.businessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Knowledge Graph',
    'ACTIVE',
    'Architecture review archive promoted into graph-ready architectural knowledge.',
    'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    architectureFinding,
    architectureRecommendation,
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(knowledgeGraphPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
      result
    })
  );

  return result;
}