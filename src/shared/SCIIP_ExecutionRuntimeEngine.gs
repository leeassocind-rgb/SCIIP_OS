/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2280 Execution Runtime Engine
 ************************************************************/

function sciipRun2280_ExecutionRuntimeEngine() {
  const processor = '2280_ExecutionRuntimeEngine';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_DISPATCHER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'dispatcherScope',
      'dispatcherName',
      'dispatcherStatus',
      'dispatcherResult',
      'executionMode',
      'nextStageNumber',
      'dispatchableProcessorCount',
      'resolvedProcessorCount',
      'unresolvedProcessorCount',
      'resolvedProcessorFunctions',
      'unresolvedProcessorRegistryKeys',
      'dispatcherPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const runtimeSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_RUNTIME',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeScope',
      'runtimeName',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_RUNTIME|' + dateKey;

  if (sciipSheetBusinessKeyExists_(runtimeSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionRuntimeEntriesCreated: 0,
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
      status: 'SKIPPED_NO_PROCESSOR_DISPATCHER',
      executionRuntimeEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let resolvedProcessorFunctions = [];

  try {
    resolvedProcessorFunctions = JSON.parse(
      sourceRecord.resolvedProcessorFunctions || '[]'
    );
  } catch (err) {
    resolvedProcessorFunctions = [];
  }

  const runtimeExecutionResults = [];
  let executedProcessorCount = 0;
  let failedProcessorCount = 0;
  let skippedProcessorCount = 0;

  resolvedProcessorFunctions.forEach(function(item) {
    const startedAt = new Date();

    try {
      const fn = globalThis[item.processorFunction];

      if (typeof fn !== 'function') {
        skippedProcessorCount++;

        runtimeExecutionResults.push({
          registryKey: item.registryKey,
          processorNumber: item.processorNumber,
          processorFunction: item.processorFunction,
          status: 'SKIPPED_FUNCTION_NOT_FOUND',
          startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString()
        });

        return;
      }

      const executionResult = fn();

      executedProcessorCount++;

      runtimeExecutionResults.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        processorFunction: item.processorFunction,
        status: 'EXECUTED',
        result: executionResult || {},
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString()
      });

    } catch (err) {
      failedProcessorCount++;

      runtimeExecutionResults.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        processorFunction: item.processorFunction,
        status: 'FAILED',
        errorMessage: err && err.message ? err.message : String(err),
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString()
      });
    }
  });

  const runtimeStatus =
    failedProcessorCount > 0
      ? 'COMPLETED_WITH_ERRORS'
      : 'COMPLETED';

  const runtimeResult =
    failedProcessorCount > 0
      ? 'RUNTIME_EXECUTION_PARTIAL_FAILURE'
      : 'RUNTIME_EXECUTION_SUCCESS';

  const now = new Date();

  const runtimePayload = {
    runtimeType: 'SCIIP_EXECUTION_RUNTIME',
    sourceDispatcherBusinessKey: sourceRecord.businessKey || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    resolvedProcessorCount: Number(sourceRecord.resolvedProcessorCount || 0),
    executedProcessorCount,
    failedProcessorCount,
    skippedProcessorCount,
    runtimeStatus,
    runtimeResult,
    executedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.dispatcherStatus || '',
    dispatcherResult: sourceRecord.dispatcherResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  runtimeSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dispatcherStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Execution Runtime Engine',
    runtimeStatus,
    runtimeResult,
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    sourceRecord.resolvedProcessorCount || 0,
    executedProcessorCount,
    failedProcessorCount,
    skippedProcessorCount,
    JSON.stringify(runtimeExecutionResults),
    JSON.stringify(runtimePayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionRuntimeEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    runtimeStatus,
    executedProcessorCount,
    failedProcessorCount,
    skippedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2280_ExecutionRuntimeEngine() {
  const result = sciipRun2280_ExecutionRuntimeEngine();

  Logger.log(JSON.stringify({
    test: 'sciipTest2280_ExecutionRuntimeEngine',
    result
  }));

  return result;
}