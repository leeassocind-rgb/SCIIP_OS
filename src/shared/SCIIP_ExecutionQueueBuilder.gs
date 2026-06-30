/************************************************************
 * SCIIP_OS v5.1
 * 2240 Execution Queue Builder
 ************************************************************/

function sciipRun2240_ExecutionQueueBuilder() {
  const processor = '2240_ExecutionQueueBuilder';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const queueSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_QUEUE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'queueScope',
      'queueName',
      'queueStatus',
      'queueResult',
      'executionMode',
      'nextStageNumber',
      'queuedProcessorCount',
      'queuedProcessorRegistryKeys',
      'queuePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_QUEUE|' + dateKey;

  if (sciipSheetBusinessKeyExists_(queueSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionQueuesCreated: 0,
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
      status: 'SKIPPED_NO_PARALLEL_EXECUTION_SCHEDULE',
      executionQueuesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let queuedProcessorRegistryKeys = [];

  try {
    queuedProcessorRegistryKeys = JSON.parse(
      sourceRecord.scheduledProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    queuedProcessorRegistryKeys = [];
  }

  const queuedProcessorCount = queuedProcessorRegistryKeys.length;
  const parallelEligibleCount = Number(sourceRecord.parallelEligibleCount || 0);
  const singleExecutionCount = Number(sourceRecord.singleExecutionCount || 0);
  const nextStageNumber = Number(sourceRecord.nextStageNumber || 0);

  let executionMode = 'NONE';

  if (parallelEligibleCount > 0) {
    executionMode = 'PARALLEL';
  } else if (singleExecutionCount === 1) {
    executionMode = 'SINGLE';
  }

  let queueStatus = 'QUEUED';
  let queueResult = 'EXECUTION_QUEUE_READY';

  if (sourceRecord.scheduleStatus === 'BLOCKED') {
    queueStatus = 'BLOCKED';
    queueResult = 'EXECUTION_QUEUE_BLOCKED';
  } else if (queuedProcessorCount === 0) {
    queueStatus = 'EMPTY';
    queueResult = 'NO_PROCESSORS_QUEUED';
  }

  const now = new Date();

  const queuePayload = {
    queueType: 'SCIIP_EXECUTION_QUEUE',
    sourceScheduleBusinessKey: sourceRecord.businessKey || '',
    executionMode,
    nextStageNumber,
    queuedProcessorCount,
    queuedProcessorRegistryKeys,
    queueStatus,
    queueResult,
    queuedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.scheduleStatus || '',
    scheduleResult: sourceRecord.scheduleResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  queueSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.scheduleStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Execution Queue',
    queueStatus,
    queueResult,
    executionMode,
    nextStageNumber,
    queuedProcessorCount,
    JSON.stringify(queuedProcessorRegistryKeys),
    JSON.stringify(queuePayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionQueuesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    queueStatus,
    queueResult,
    queuedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2240_ExecutionQueueBuilder() {
  const result = sciipRun2240_ExecutionQueueBuilder();

  Logger.log(JSON.stringify({
    test: 'sciipTest2240_ExecutionQueueBuilder',
    result
  }));

  return result;
}