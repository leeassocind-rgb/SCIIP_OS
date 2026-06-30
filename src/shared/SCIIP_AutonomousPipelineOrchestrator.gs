/************************************************************
 * SCIIP_OS v5.1
 * 2220 Autonomous Pipeline Orchestrator
 ************************************************************/

function sciipRun2220_AutonomousPipelineOrchestrator() {
  const processor = '2220_AutonomousPipelineOrchestrator';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const orchestrationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'orchestrationScope',
      'orchestrationName',
      'orchestrationStatus',
      'orchestrationResult',
      'plannedProcessorCount',
      'readyProcessorCount',
      'blockedProcessorCount',
      'executionStageCount',
      'nextStageNumber',
      'nextProcessorRegistryKeys',
      'orchestrationDecision',
      'orchestrationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(orchestrationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousPipelineOrchestrationsCreated: 0,
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
      status: 'SKIPPED_NO_DEPENDENCY_RESOLUTION',
      autonomousPipelineOrchestrationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let resolutionPayload = {};
  try {
    resolutionPayload = JSON.parse(sourceRecord.resolutionPayloadJson || '{}');
  } catch (err) {
    resolutionPayload = {};
  }

  const stages = resolutionPayload.stages || [];
  const unresolvedProcessorRegistryKeys =
    resolutionPayload.unresolvedProcessorRegistryKeys || [];

  const plannedProcessorCount =
    Number(sourceRecord.plannedProcessorCount || 0);

  const readyProcessorCount =
    Number(sourceRecord.readyProcessorCount || 0);

  const blockedProcessorCount =
    Number(sourceRecord.blockedProcessorCount || 0);

  const executionStageCount =
    Number(sourceRecord.executionStageCount || stages.length || 0);

  const nextStage =
    stages.length > 0
      ? stages[0]
      : {
          stageNumber: 0,
          processorRegistryKeys: []
        };

  const nextStageNumber = nextStage.stageNumber || 0;
  const nextProcessorRegistryKeys = nextStage.processorRegistryKeys || [];

  let orchestrationDecision = 'NO_ACTION';

  if (unresolvedProcessorRegistryKeys.length > 0) {
    orchestrationDecision = 'HALT_UNRESOLVED_DEPENDENCIES';
  } else if (nextProcessorRegistryKeys.length > 1) {
    orchestrationDecision = 'READY_FOR_PARALLEL_EXECUTION';
  } else if (nextProcessorRegistryKeys.length === 1) {
    orchestrationDecision = 'READY_FOR_SINGLE_EXECUTION';
  }

  const orchestrationStatus =
    orchestrationDecision === 'HALT_UNRESOLVED_DEPENDENCIES'
      ? 'BLOCKED'
      : 'ORCHESTRATED';

  const orchestrationResult =
    orchestrationDecision === 'HALT_UNRESOLVED_DEPENDENCIES'
      ? 'ORCHESTRATION_BLOCKED'
      : 'ORCHESTRATION_READY';

  const now = new Date();

  const orchestrationPayload = {
    orchestrationType: 'SCIIP_AUTONOMOUS_PIPELINE_ORCHESTRATION',
    sourceDependencyResolutionBusinessKey: sourceRecord.businessKey || '',
    plannedProcessorCount: plannedProcessorCount,
    readyProcessorCount: readyProcessorCount,
    blockedProcessorCount: blockedProcessorCount,
    executionStageCount: executionStageCount,
    nextStageNumber: nextStageNumber,
    nextProcessorRegistryKeys: nextProcessorRegistryKeys,
    unresolvedProcessorRegistryKeys: unresolvedProcessorRegistryKeys,
    orchestrationDecision: orchestrationDecision,
    orchestratedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.resolutionStatus || '',
    resolutionResult: sourceRecord.resolutionResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  orchestrationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.resolutionStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Autonomous Pipeline Orchestration',
    orchestrationStatus,
    orchestrationResult,
    plannedProcessorCount,
    readyProcessorCount,
    blockedProcessorCount,
    executionStageCount,
    nextStageNumber,
    JSON.stringify(nextProcessorRegistryKeys),
    orchestrationDecision,
    JSON.stringify(orchestrationPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousPipelineOrchestrationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    orchestrationDecision,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2220_AutonomousPipelineOrchestrator() {
  const result = sciipRun2220_AutonomousPipelineOrchestrator();

  Logger.log(JSON.stringify({
    test: 'sciipTest2220_AutonomousPipelineOrchestrator',
    result
  }));

  return result;
}