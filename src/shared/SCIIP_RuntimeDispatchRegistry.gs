/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2260 Runtime Dispatch Registry
 ************************************************************/

function sciipRun2260_RuntimeDispatchRegistry() {
  const processor = '2260_RuntimeDispatchRegistry';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_QUEUE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'queueLedgerScope',
      'queueLedgerName',
      'queueLedgerStatus',
      'ledgeredQueueBusinessKey',
      'executionMode',
      'nextStageNumber',
      'queuedProcessorCount',
      'queuedProcessorRegistryKeys',
      'queueLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const dispatchSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey = 'SCIIP_RUNTIME_DISPATCH_REGISTRY|' + dateKey;

  if (sciipSheetBusinessKeyExists_(dispatchSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeDispatchRegistriesCreated: 0,
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
      status: 'SKIPPED_NO_EXECUTION_QUEUE_LEDGER',
      runtimeDispatchRegistriesCreated: 0,
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
      sourceRecord.queuedProcessorRegistryKeys || '[]'
    );
  } catch (err) {
    dispatchableProcessorRegistryKeys = [];
  }

  const dispatchableProcessorCount = dispatchableProcessorRegistryKeys.length;
  const executionMode = sourceRecord.executionMode || 'NONE';
  const nextStageNumber = Number(sourceRecord.nextStageNumber || 0);

  let dispatchStatus = 'READY';
  let dispatchResult = 'DISPATCH_READY';

  if (dispatchableProcessorCount === 0) {
    dispatchStatus = 'EMPTY';
    dispatchResult = 'NO_PROCESSORS_TO_DISPATCH';
  }

  const now = new Date();

  const dispatchRegistryPayload = {
    dispatchRegistryType: 'SCIIP_RUNTIME_DISPATCH_REGISTRY',
    sourceExecutionQueueLedgerBusinessKey: sourceRecord.businessKey || '',
    executionMode,
    nextStageNumber,
    dispatchableProcessorCount,
    dispatchableProcessorRegistryKeys,
    dispatchStatus,
    dispatchResult,
    registeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.queueLedgerStatus || '',
    executionMode,
    createdAt: sourceRecord.createdAt || ''
  };

  dispatchSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.queueLedgerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Dispatch Registry',
    dispatchStatus,
    dispatchResult,
    executionMode,
    nextStageNumber,
    dispatchableProcessorCount,
    JSON.stringify(dispatchableProcessorRegistryKeys),
    JSON.stringify(dispatchRegistryPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeDispatchRegistriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    dispatchStatus,
    dispatchableProcessorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2260_RuntimeDispatchRegistry() {
  const result = sciipRun2260_RuntimeDispatchRegistry();

  Logger.log(JSON.stringify({
    test: 'sciipTest2260_RuntimeDispatchRegistry',
    result
  }));

  return result;
}