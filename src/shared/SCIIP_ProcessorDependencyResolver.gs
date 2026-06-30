/************************************************************
 * SCIIP_OS v5.1
 * 2210 Processor Dependency Resolver
 ************************************************************/

function sciipRun2210_ProcessorDependencyResolver() {
  const processor = '2210_ProcessorDependencyResolver';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_EXECUTION_PLAN',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'planScope',
      'planName',
      'planStatus',
      'plannedProcessorCount',
      'plannedEdgeCount',
      'rootProcessorCount',
      'terminalProcessorCount',
      'executionStageCount',
      'executionPlanPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const resolverSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'resolutionScope',
      'resolutionName',
      'resolutionStatus',
      'resolutionResult',
      'plannedProcessorCount',
      'resolvedProcessorCount',
      'unresolvedProcessorCount',
      'executionStageCount',
      'readyProcessorCount',
      'blockedProcessorCount',
      'resolutionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(resolverSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorDependencyResolutionsCreated: 0,
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
      status: 'SKIPPED_NO_EXECUTION_PLAN',
      processorDependencyResolutionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let planPayload = {};
  try {
    planPayload = JSON.parse(sourceRecord.executionPlanPayloadJson || '{}');
  } catch (err) {
    planPayload = {};
  }

  const stages = planPayload.stages || [];
  const unresolved = planPayload.unresolvedProcessorRegistryKeys || [];

  const plannedProcessorCount =
    Number(sourceRecord.plannedProcessorCount || planPayload.plannedProcessorCount || 0);

  const executionStageCount =
    Number(sourceRecord.executionStageCount || planPayload.executionStageCount || stages.length || 0);

  let resolvedProcessorCount = 0;
  stages.forEach(function(stage) {
    resolvedProcessorCount += (stage.processorRegistryKeys || []).length;
  });

  const unresolvedProcessorCount = unresolved.length;

  const firstStage = stages.length > 0 ? stages[0] : null;
  const readyProcessorCount = firstStage
    ? (firstStage.processorRegistryKeys || []).length
    : 0;

  const blockedProcessorCount =
    Math.max(plannedProcessorCount - readyProcessorCount, 0);

  const resolutionResult =
    unresolvedProcessorCount === 0
      ? 'DEPENDENCIES_RESOLVED'
      : 'DEPENDENCIES_UNRESOLVED';

  const resolutionStatus =
    unresolvedProcessorCount === 0
      ? 'RESOLVED'
      : 'RESOLUTION_ATTENTION_REQUIRED';

  const now = new Date();

  const resolutionPayload = {
    resolutionType: 'SCIIP_PROCESSOR_DEPENDENCY_RESOLUTION',
    sourceExecutionPlanBusinessKey: sourceRecord.businessKey || '',
    plannedProcessorCount: plannedProcessorCount,
    resolvedProcessorCount: resolvedProcessorCount,
    unresolvedProcessorCount: unresolvedProcessorCount,
    executionStageCount: executionStageCount,
    readyProcessorCount: readyProcessorCount,
    blockedProcessorCount: blockedProcessorCount,
    resolutionResult: resolutionResult,
    stages: stages,
    unresolvedProcessorRegistryKeys: unresolved,
    resolvedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.planStatus || '',
    executionStageCount: sourceRecord.executionStageCount || '',
    createdAt: sourceRecord.createdAt || ''
  };

  resolverSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.planStatus || '',
    'SCIIP_PROCESSOR_EXECUTION',
    'SCIIP Processor Dependency Resolution',
    resolutionStatus,
    resolutionResult,
    plannedProcessorCount,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    executionStageCount,
    readyProcessorCount,
    blockedProcessorCount,
    JSON.stringify(resolutionPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorDependencyResolutionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    resolutionResult,
    unresolvedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2210_ProcessorDependencyResolver() {
  const result = sciipRun2210_ProcessorDependencyResolver();

  Logger.log(JSON.stringify({
    test: 'sciipTest2210_ProcessorDependencyResolver',
    result
  }));

  return result;
}