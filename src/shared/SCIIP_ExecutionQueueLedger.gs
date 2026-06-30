/************************************************************
 * SCIIP_OS v5.1
 * 2250 Execution Queue Ledger
 ************************************************************/

function sciipRun2250_ExecutionQueueLedger() {
  const processor = '2250_ExecutionQueueLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey = 'SCIIP_EXECUTION_QUEUE_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionQueueLedgerEntriesCreated: 0,
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
      status: 'SKIPPED_NO_EXECUTION_QUEUE',
      executionQueueLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SCIIP_EXECUTION_QUEUE_LEDGER',
    ledgeredQueueBusinessKey: sourceRecord.businessKey || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    queuedProcessorCount: Number(sourceRecord.queuedProcessorCount || 0),
    queuedProcessorRegistryKeys: sourceRecord.queuedProcessorRegistryKeys || '[]',
    queueStatus: sourceRecord.queueStatus || '',
    queueResult: sourceRecord.queueResult || '',
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.queueStatus || '',
    queueResult: sourceRecord.queueResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.queueStatus || '',
    'SCIIP_AUTONOMOUS_PIPELINE',
    'SCIIP Execution Queue Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    sourceRecord.queuedProcessorCount || 0,
    sourceRecord.queuedProcessorRegistryKeys || '[]',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionQueueLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2250_ExecutionQueueLedger() {
  const result = sciipRun2250_ExecutionQueueLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2250_ExecutionQueueLedger',
    result
  }));

  return result;
}