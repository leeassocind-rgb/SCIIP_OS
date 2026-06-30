/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2270 Processor Dispatcher
 ************************************************************/

function sciipRun2270_ProcessorDispatcher() {
  const processor = '2270_ProcessorDispatcher';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_DISPATCH_REGISTRY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'dispatchScope',
      'dispatchName',
      'dispatchStatus',
      'dispatchResult',
      'executionMode',
      'nextStageNumber',
      'dispatchableProcessorCount',
      'dispatchableProcessorRegistryKeys',
      'dispatchRegistryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const dispatcherSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey = 'SCIIP_PROCESSOR_DISPATCHER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(dispatcherSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorDispatchersCreated: 0,
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
      status: 'SKIPPED_NO_RUNTIME_DISPATCH_REGISTRY',
      processorDispatchersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let dispatchableProcessorRegistryKeys = [];

  try {
    dispatchableProcessorRegistryKeys = JSON.parse(
      sourceRecord.dispatchableProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    dispatchableProcessorRegistryKeys = [];
  }

  const registry = sciipGetProcessorRegistry_();

  const resolvedProcessorFunctions = [];
  const unresolvedProcessorRegistryKeys = [];

  dispatchableProcessorRegistryKeys.forEach(function(registryKey) {
    const item = registry[registryKey];

    if (item && item.processorFunction && typeof this[item.processorFunction] === 'function') {
      resolvedProcessorFunctions.push({
        registryKey: registryKey,
        processorNumber: item.processorNumber,
        processorFunction: item.processorFunction,
        testFunction: item.testFunction || '',
        inputSheet: item.inputSheet || '',
        outputSheet: item.outputSheet || '',
        track: item.track || '',
        version: item.version || ''
      });
    } else {
      unresolvedProcessorRegistryKeys.push(registryKey);
    }
  });

  const resolvedProcessorCount = resolvedProcessorFunctions.length;
  const unresolvedProcessorCount = unresolvedProcessorRegistryKeys.length;

  const dispatcherStatus =
    unresolvedProcessorCount === 0 ? 'RESOLVED' : 'RESOLUTION_ATTENTION_REQUIRED';

  const dispatcherResult =
    unresolvedProcessorCount === 0
      ? 'DISPATCH_FUNCTIONS_RESOLVED'
      : 'DISPATCH_FUNCTIONS_UNRESOLVED';

  const now = new Date();

  const dispatcherPayload = {
    dispatcherType: 'SCIIP_PROCESSOR_DISPATCHER',
    sourceDispatchRegistryBusinessKey: sourceRecord.businessKey || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    dispatchableProcessorCount: dispatchableProcessorRegistryKeys.length,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    resolvedProcessorFunctions,
    unresolvedProcessorRegistryKeys,
    dispatcherStatus,
    dispatcherResult,
    resolvedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.dispatchStatus || '',
    dispatchResult: sourceRecord.dispatchResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  dispatcherSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dispatchStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Processor Dispatcher',
    dispatcherStatus,
    dispatcherResult,
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    dispatchableProcessorRegistryKeys.length,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    JSON.stringify(resolvedProcessorFunctions),
    JSON.stringify(unresolvedProcessorRegistryKeys),
    JSON.stringify(dispatcherPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorDispatchersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    dispatcherStatus,
    resolvedProcessorCount,
    unresolvedProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2270_ProcessorDispatcher() {
  const result = sciipRun2270_ProcessorDispatcher();

  Logger.log(JSON.stringify({
    test: 'sciipTest2270_ProcessorDispatcher',
    result
  }));

  return result;
}