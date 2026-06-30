/************************************************************
 * SCIIP_OS v5.1
 * 2230 Parallel Execution Scheduler
 ************************************************************/

function sciipRun2230_ParallelExecutionScheduler() {
  const processor = '2230_ParallelExecutionScheduler';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const scheduleSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PARALLEL_EXECUTION_SCHEDULE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'scheduleScope',
      'scheduleName',
      'scheduleStatus',
      'scheduleResult',
      'nextStageNumber',
      'scheduledProcessorCount',
      'parallelEligibleCount',
      'singleExecutionCount',
      'blockedProcessorCount',
      'scheduledProcessorRegistryKeys',
      'schedulePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PARALLEL_EXECUTION_SCHEDULE|' + dateKey;

  if (sciipSheetBusinessKeyExists_(scheduleSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      parallelExecutionSchedulesCreated: 0,
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
      status: 'SKIPPED_NO_ORCHESTRATION',
      parallelExecutionSchedulesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let scheduledProcessorRegistryKeys = [];

  try {
    scheduledProcessorRegistryKeys = JSON.parse(
      sourceRecord.nextProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    scheduledProcessorRegistryKeys = [];
  }

  const orchestrationDecision = sourceRecord.orchestrationDecision || '';
  const blockedProcessorCount = Number(sourceRecord.blockedProcessorCount || 0);
  const nextStageNumber = Number(sourceRecord.nextStageNumber || 0);
  const scheduledProcessorCount = scheduledProcessorRegistryKeys.length;

  let scheduleStatus = 'SCHEDULED';
  let scheduleResult = 'EXECUTION_SCHEDULE_READY';

  if (orchestrationDecision === 'HALT_UNRESOLVED_DEPENDENCIES') {
    scheduleStatus = 'BLOCKED';
    scheduleResult = 'EXECUTION_SCHEDULE_BLOCKED';
  } else if (scheduledProcessorCount === 0) {
    scheduleStatus = 'NO_READY_PROCESSORS';
    scheduleResult = 'NO_EXECUTION_SCHEDULE_CREATED';
  }

  const parallelEligibleCount =
    scheduledProcessorCount > 1 ? scheduledProcessorCount : 0;

  const singleExecutionCount =
    scheduledProcessorCount === 1 ? 1 : 0;

  const now = new Date();

  const schedulePayload = {
    scheduleType: 'SCIIP_PARALLEL_EXECUTION_SCHEDULE',
    sourceOrchestrationBusinessKey: sourceRecord.businessKey || '',
    orchestrationDecision: orchestrationDecision,
    nextStageNumber: nextStageNumber,
    scheduledProcessorCount: scheduledProcessorCount,
    parallelEligibleCount: parallelEligibleCount,
    singleExecutionCount: singleExecutionCount,
    blockedProcessorCount: blockedProcessorCount,
    scheduledProcessorRegistryKeys: scheduledProcessorRegistryKeys,
    executionMode:
      parallelEligibleCount > 0
        ? 'PARALLEL'
        : singleExecutionCount === 1
          ? 'SINGLE'
          : 'NONE',
    scheduledAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.orchestrationStatus || '',
    orchestrationResult: sourceRecord.orchestrationResult || '',
    orchestrationDecision: orchestrationDecision,
    createdAt: sourceRecord.createdAt || ''
  };

  scheduleSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.orchestrationStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Parallel Execution Schedule',
    scheduleStatus,
    scheduleResult,
    nextStageNumber,
    scheduledProcessorCount,
    parallelEligibleCount,
    singleExecutionCount,
    blockedProcessorCount,
    JSON.stringify(scheduledProcessorRegistryKeys),
    JSON.stringify(schedulePayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    parallelExecutionSchedulesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    scheduleStatus,
    scheduleResult,
    scheduledProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2230_ParallelExecutionScheduler() {
  const result = sciipRun2230_ParallelExecutionScheduler();

  Logger.log(JSON.stringify({
    test: 'sciipTest2230_ParallelExecutionScheduler',
    result
  }));

  return result;
}